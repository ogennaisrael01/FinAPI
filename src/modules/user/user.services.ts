import { Request } from "express";
import { emailVerificationSchema, loginSchema, onboardingSchema, registerSchema, userVerificationSchema, validatePhone } from "./user.validators";
import bcrypt from "bcryptjs"
import { UserRepository } from "./user.repository";
import { logger } from "../../logger";
import { OtpService } from "../otp/otp.services";
import { ZodError } from "zod";
import { queueClient } from "../../queue/queue.tasks";
import { OtpRepository } from "../otp/otp.repository";
import { VerificationTypes } from "./types";
import { OtpCodes, User } from "../../../generated/prisma/browser";
import { issueToken } from "../../JWT/config";
import { JobNames } from "../../queue/types";
import { fileTypes } from "../../queue/types";
import { DocumentRepootory } from "../kycDocuments/kyc.repositories";


export function flattenErrorMesage(error: ZodError){
    const flattened = error.flatten()
    const formErrors = flattened.formErrors || []
    const fieldErrors = flattened.fieldErrors || {}
    const fieldMessages = Object.values(fieldErrors).flat()
    const message = (formErrors.length ? formErrors : fieldMessages).join(', ') || 'Validation error'
    return message
}
export class UserService {
    async setPassword(password: string): Promise<string>{
        return await bcrypt.hash(password, Number(process.env.SALT || 10))
    }

    async checkPassword(password: string, hashedPassword: string): Promise<boolean>{
        return await bcrypt.compare(password, hashedPassword)
    }
    
    async registerUser(req: Request){
        logger.debug("Processing User registeration")

        const payload = req.body
        const result = registerSchema.safeParse(payload)
        if (!result.success){
            const message = flattenErrorMesage(result.error)
            throw new Error(message)
        }
        const { phone, password } = result.data
        const isValidPhone = validatePhone(phone)
        if (!isValidPhone.isValid){
            throw new Error("Phone number is invalid")
        }
        const Vphone = isValidPhone.phoneNumber
        const checkDuplicate = await new UserRepository().findUserByPhone(Vphone)
        if (checkDuplicate){
            throw new Error("User with this phone number already exists")
        }
        const hashedPassword = await this.setPassword(password)
        const user = await new UserRepository().createUser(Vphone, hashedPassword)
        const code = await new OtpService().createOTP(user.id, VerificationTypes.phone_verification)

        /// process the job to send sms in the background
        const job = await queueClient.add("send_sms", {userId: user.id, code: code})
        return {message: "User registered successfully", userId: user.id, jobId: job.id}
    }

    async userVerification (req: Request){
        logger.debug("Processing User verification")

        const result = userVerificationSchema.safeParse(req.body)
        if (!result.success){
            throw new Error(flattenErrorMesage(result.error))
        }
        const { code,  type } = result.data
        if (!(type in VerificationTypes)){
            throw new Error("Invalid verification type")
        }
        const codeHash = await new OtpService().hashCode(code)
        const otp = await new OtpRepository().findOtpByCode(codeHash)
        if(!otp){
            logger.debug("Otp code not found", {meta: code.slice(-4)}); throw new Error("Code not found")
        }
        await this.checkMaxAttempts(otp)
        if (otp.isUsed){
            logger.debug("Otp code already used", {meta: code.slice(-4)}); throw new Error("Code already used")
        }
        if (otp.expiresAt < new Date()){
            logger.debug("Otp code expired", {meta: code.slice(-4)}); throw new Error("Code expired")
        }

        let tokens;
        if (otp.type === VerificationTypes.phone_verification){
            await new UserRepository().updateUser(otp.userId, {phoneVerified: true})
            // Issue tokens to user too continue with onboarding process
            tokens = issueToken(otp.user)
        }
        else if (otp.type === VerificationTypes.email_verification){
            await new UserRepository().updateUser(otp.userId, {emailVerified: true})
            tokens = null
        }
        else {
            throw new Error("Invalid verification type")
        }
        await new OtpRepository().invalidateOtp(otp.id)
        return {message: "User verified successfully", userId: otp.userId, tokens}
    }

    async checkMaxAttempts(otp: OtpCodes){
        const maxAttempts = Number(process.env.MAX_OTP_ATTEMPTS || 5)
        if (otp.attempts >= maxAttempts){
            logger.debug("Max OTP attempts reached", {meta: otp.id}); throw new Error("Max OTP attempts reached")
        }
        await new OtpRepository().incrementAttempts(otp.id)
    }

    async verificationEmail(req: Request){
        const result = emailVerificationSchema.safeParse(req.body)
        if (!result.success){
            logger.debug("Email verification validation failed", {meta: flattenErrorMesage(result.error)}); 
            throw new Error(flattenErrorMesage(result.error))
        }
        const { email } = result.data
        const user = req.user
        const code = await new OtpService().createOTP(user?.id, VerificationTypes.email_verification)
        // add job to queue
        const job = await queueClient.add(JobNames.SEND_EMAIL, {code: code, email: email})
        return { message: "verification email sent", serverTimeStamp:Date.now()}
    }

    async processKYCUpload(userId: string, secureUrl: string, idType: string){
        return await new DocumentRepootory().createUserIdentity(userId, secureUrl, idType)
    }

    async completeProfile (req: Request ){
        const result = onboardingSchema.safeParse(JSON.parse(req.body.data))
        if (!result.success){
            const message = flattenErrorMesage(result.error)
            logger.debug("Invalid Data:", {errors: message})
            throw new Error(message)
        }
        const user: User = req.user
        if (!user.phoneVerified || !user.emailVerified){
            logger.debug("account is not active");throw new Error("Failed to process request. invalid account")
        }
        const { email, firstName, lastName, middleName, gender, DOB, address, userIdentity } = result.data
        if (!req.file) throw new Error("User ID is required")

        // update user profile 
        const data = { email, firstName, lastName, gender, dateOfBirth:DOB, address, middleName}
        await new UserRepository().updateUser(user.id, data)

        // add file upload to queue
        const idType = userIdentity.type
        await queueClient.add(JobNames.FILE_UPLOAD, {file: req.file, userId: user.id, type: fileTypes.KYC_DOCUMENT, idType})

        // add another job to create the customer
        const idempotencyKey = req.headers["x-idempotency-key"] ?? crypto.randomUUID()
        await queueClient.add(JobNames.FLW_CREATE_CUSTOMER, { userId: user.id, idempotencyKey})

        return { message: "onboard complete", userId: user.id, serverTimeStamp: Date.now()}
    }

    async getToken(req: Request){
        // the base login for fresh user or if access token has been revoked
        const result = loginSchema.safeParse(req.body)
        if (!result.success){
            const message = flattenErrorMesage(result.error)
            throw new Error(message)
        }
        const { phone, password } = result.data

        const validPhone = validatePhone(phone)
        if(!validPhone.isValid){
            throw new Error('Invalid Phone number')
        }
        const user = await new UserRepository().findUserByPhone(validPhone.phoneNumber)
        // should be able to fetch access token is phone number has been verified
        if (!user?.phoneVerified){
            throw new Error("Invalid credentials")
        }
        if (!this.checkPassword(password, user.passwordHash)){
            throw new Error("Invalid Credentials")
        }

        // issue both access and refresh tokens to user
        const tokens = await issueToken(user)
        return {serverTimestamp: Date.now(), tokens}

    }

}