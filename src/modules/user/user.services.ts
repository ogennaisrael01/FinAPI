import { Request } from "express";
import { registerSchema, validatePhone } from "./user.validators";
import bcrypt from "bcryptjs"
import { UserRepository } from "./user.repository";
import { logger } from "../../logger";
import { OtpService } from "../otp/otp.services";
import { ZodError } from "zod";
import { queueClient } from "../../queue/queue.tasks";

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
        const checkDuplicate = await new UserRepository().findUserByPhone(phone)
        if (checkDuplicate){
            throw new Error("User with this phone number already exists")
        }
        const isValid = validatePhone(phone)
        if (!isValid){
            throw new Error("Phone number is invalid")
        }
        const hashedPassword = await this.setPassword(password)
        const user = await new UserRepository().createUser(phone, hashedPassword)
        const code = await new OtpService().createOTP(user.id, "phone_verification")

        /// process the job to send sms in the background
        const job = queueClient.add("send_sms", {userId: user.id, code: code}, {removeOnComplete: true, removeOnFail: true})

        return {message: "User registered successfully", userId: user.id}
    }
}