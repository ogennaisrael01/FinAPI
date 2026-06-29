import { Request, response } from "express";
import { bvnVerificationSchema, emailVerificationSchema, loginSchema, onboardingSchema, registerSchema, resendCodeSchema, TransactionPinSchema, updateProfileSchema, userVerificationSchema, validatePhone } from "./user.validators";
import bcrypt from "bcryptjs"
import { UserRepository } from "./user.repository";
import { logger } from "../../logger";
import { OtpService } from "../otp/otp.services";
import { success, ZodError } from "zod";
import { queueClient } from "../../queue/queue.tasks";
import { OtpRepository } from "../otp/otp.repository";
import { fetchAccountLimits, VerificationTypes } from "./types";
import { OtpCodes, User } from "../../../generated/prisma/browser";
import { issueToken } from "../../JWT/config";
import { JobNames } from "../../queue/types";
import { fileTypes } from "../../queue/types";
import { DocumentRepository } from "../kycDocuments/kyc.repositories";
import { AuthenticationError, ConflictError, NotFoundError, ValidationError } from "../../errors/AppError";
import { RateLimitError } from "bullmq";
import { WalletRepository } from "../wallets/repository";

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
            throw new ValidationError(message, result.error.flatten())
        }
        const { phone, password } = result.data
        const isValidPhone = validatePhone(phone)
        if (!isValidPhone.isValid){
            throw new ValidationError("Phone number is invalid")
        }
        const Vphone = isValidPhone.phoneNumber
        const checkDuplicate = await new UserRepository().findUserByPhone(Vphone)
        if (checkDuplicate){
            throw new ConflictError("User with this phone number already exists")
        }
        const hashedPassword = await this.setPassword(password)
        const user = await new UserRepository().createUser(Vphone, hashedPassword)
        const code = await new OtpService().createOTP(user.id, VerificationTypes.phone_verification)
        
        // set up user wallet 
        await new WalletRepository().createWallet(user.id)

        /// process the job to send sms in the background
        const job = await queueClient.add("send_sms", {phone: Vphone, code: code})
        return {message: "User registered successfully", userId: user.id, jobId: job.id}
    }

    async userVerification (req: Request){
        logger.debug("Processing User verification")

        const result = userVerificationSchema.safeParse(req.body)
        if (!result.success){
            throw new ValidationError(flattenErrorMesage(result.error), result.error.flatten())
        }
        const { code,  type } = result.data
        if (!(type in VerificationTypes)){
            throw new ValidationError("Invalid verification type")
        }
        const codeHash = await new OtpService().hashCode(code)
        const otp = await new OtpRepository().findOtpByCode(codeHash)
        if(!otp){
            logger.debug("Otp code not found", {meta: code.slice(-4)}); 
            throw new NotFoundError("Code not found")
        }
        await this.checkMaxAttempts(otp)
        if (otp.isUsed){
            logger.debug("Otp code already used", {meta: code.slice(-4)}); 
            throw new ValidationError("Code already used")
        }
        if (otp.expiresAt < new Date()){
            logger.debug("Otp code expired", {meta: code.slice(-4)}); 
            throw new ValidationError("Code expired")
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
            throw new ValidationError("Invalid verification type")
        }
        await new OtpRepository().invalidateOtp(otp.id)
        return {message: "User verified successfully", userId: otp.userId, tokens}
    }

    async checkMaxAttempts(otp: OtpCodes){
        const maxAttempts = Number(process.env.MAX_OTP_ATTEMPTS || 5)
        if (otp.attempts >= maxAttempts){
            logger.debug("Max OTP attempts reached", {meta: otp.id}); 
            throw new RateLimitError("Max OTP attempts reached")
        }
        await new OtpRepository().incrementAttempts(otp.id)
    }

    async verificationEmail(req: Request){
        const result = emailVerificationSchema.safeParse(req.body)
        if (!result.success){
            logger.debug("Email verification validation failed", {meta: flattenErrorMesage(result.error)}); 
            throw new ValidationError(flattenErrorMesage(result.error), result.error.flatten())
        }
        const { email } = result.data
        const user = req.user
        const code = await new OtpService().createOTP(user?.id, VerificationTypes.email_verification)
        // add job to queue
        const job = await queueClient.add(JobNames.SEND_EMAIL, {code: code, email: email})
        return { message: "verification email sent", serverTimeStamp:Date.now()}
    }

    async resendVerificationCode(req: Request){
        const result = resendCodeSchema.safeParse(req.body)
        if(!result.success){
            throw new ValidationError(flattenErrorMesage(result.error), result.error.flatten())
        }
        const { phone, email, verificationType } = result.data
        if (verificationType === VerificationTypes.phone_verification && !phone){
            throw new ValidationError("Phone verification require the phone number")
        }
        else if(verificationType === VerificationTypes.email_verification && !email){
            throw new ValidationError("email veirfiation require the email address")
        }
       
        const user = phone && !email ?
            await new UserRepository().findUserByPhone(phone as string) :
            await new UserRepository().findUserByEmail(email as string)
        
        if (!user){
            throw new NotFoundError('User not found')
        }
        const code = await new OtpService().createOTP(user.id, verificationType)
        const job = verificationType === VerificationTypes.email_verification ? 
            await queueClient.add(JobNames.SEND_EMAIL, {email: user.email, code: code}) : 
            await queueClient.add(JobNames.SEND_SMS, {phone: user.phone, code: code})

        return { status: true, message: "code resent", serverTimeStamp: Date.now()}
    }

    async processKYCUpload(userId: string, secureUrl: string, idType: string){
        return await new DocumentRepository().createUserIdentity(userId, secureUrl, idType)
    }

    async completeProfile (req: Request ){
        const result = onboardingSchema.safeParse(JSON.parse(req.body.data))
        if (!result.success){
            const message = flattenErrorMesage(result.error)
            throw new ValidationError(message, result.error.flatten())
        }
        const user: User = req.user
        if (!user.phoneVerified || !user.emailVerified){
            logger.debug("account is not active");
            throw new AuthenticationError("Failed to process request. invalid account")
        }
        const { email, firstName, lastName, middleName, gender, DOB, address, userIdentity } = result.data
        if (!req.file)throw new ValidationError("User identity upload is required")

        // update user profile 
        const data = { email, firstName, lastName, gender, dateOfBirth:DOB, address, middleName, kycTier: 1}
        await new UserRepository().updateUser(user.id, data)

        // add file upload to queue
        const idType = userIdentity.type
        await queueClient.add(JobNames.FILE_UPLOAD, {file: req.file, userId: user.id, type: fileTypes.KYC_DOCUMENT, idType})
        return { message: "onboard complete", userId: user.id, serverTimeStamp: Date.now()}
    }

    async getToken(req: Request){
        // the base login for fresh user or if access token has been revoked
        const result = loginSchema.safeParse(req.body)
        if (!result.success){
            const message = flattenErrorMesage(result.error)
            throw new ValidationError(message, result.error.flatten())
        }
        const { phone, password } = result.data

        const validPhone = validatePhone(phone)
        if(!validPhone.isValid){
            throw new AuthenticationError('Invalid Phone number')
        }
        const user = await new UserRepository().findUserByPhone(validPhone.phoneNumber)
        // should be able to fetch access token is phone number has been verified
        if (!user?.phoneVerified){
            throw new AuthenticationError("Invalid credentials")
        }
        if (!this.checkPassword(password, user.passwordHash)){
            throw new AuthenticationError("Invalid Credentials")
        }
        // issue both access and refresh tokens to user
        const tokens = await issueToken(user)
        return {serverTimestamp: Date.now(), tokens}

    }

    async bvnVerificationRequest(req: Request){
        const result = bvnVerificationSchema.safeParse(req.body)
        if (!result.success){
            throw new ValidationError(flattenErrorMesage(result.error), result.error.flatten())
        }
        const user: User = req.user
        const { bvn } = result.data
        const jon = await queueClient.add(JobNames.BVN_VERIFICATION, {userId: user.id, bvn: bvn})
        return {status: true, message: "Task queued: In progress", serverTimeStamp: Date.now()}
    }

    async setTransactionPin(req: Request){
        const result = TransactionPinSchema.safeParse(req.body)
        if (!result.success){
            throw new ValidationError(flattenErrorMesage(result.error), result.error.flatten())
        }

        const { pin } = result.data
        const user: User = req.user
        const userTier = user.kycTier
        if (userTier < 1){
            throw new ValidationError("Account is not active")
        }
        const pinHash = await this.setPassword(pin)
        await new UserRepository().updateUser(user.id, {pinHash})
        return { status: "success", message: "Pin set successfully"}
    }

    async userProfile(user: User){
        const profile = await new UserRepository().findUserById(user.id)
        return profile
    }

    async updateUserProfile(req: Request){
        const result = updateProfileSchema.safeParse(req.body)
        if (!result.success){
            throw new ValidationError(flattenErrorMesage(result.error), result.error.flatten())
        }
        const data = result.data
        const updatedProfile = await new UserRepository().updateUser(req.user.id, data)
        return { success: true, details: data, serverTimeStamp:  Date.now()}
    }

    async setProfilePicture(req: Request){
        await queueClient.add(JobNames.FILE_UPLOAD, {file: req.file, userId: req.user.id, type: fileTypes.PROFILE_PICTURE})
        return { status: true, message: "profile updated", serverTimeStamp: Date.now()}
    }

    async savePicture(userId: string, secure_url: string, publicId: string){
        const data = { secure_url, publicId, serverTimeStamp: Date.now() }
        return await new UserRepository().updateUser(userId, {profilePhotoUrl: data})
    }

    async accountLimits(req: Request){
        // return the full tier account limits
        const accounts = fetchAccountLimits()
        const user = await new UserRepository().findUserById(req.user.id)
        return { status: true, details: { user: user, accounts: accounts}}
    }
}