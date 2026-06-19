import * as crypto from "crypto";
import { OtpRepository } from './otp.repository';
import { logger } from '../../logger';

export class OtpService {

    async generateCode(userId: string): Promise<string>{
        const maxLength = 6; 
        const codeA = []
        for (let i=1;  i<= maxLength; i++){
            const code = Math.floor(Math.random() * 10)
            codeA.push(code)
        }
        return codeA.join("")
    }

    async hashCode (code: string): Promise<string>{
        return crypto.createHash("sha256").update(code).digest("hex")
    }
    
    async createOTP(userId: string, type: string): Promise<string>{
        logger.debug("Creating OTP for user", {meta: userId.slice(0, 3) + "....."})

        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + Number(process.env.OTP_EXPIRY || 10))
        const code = await this.generateCode(userId)
        const otpHash = await this.hashCode(code)
        const otp = await new OtpRepository().createOTP(userId, type, otpHash, expiresAt)
        return code
    }
}