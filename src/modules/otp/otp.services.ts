import bcrypt from 'bcryptjs';
import { OtpRepository } from './otp.repository';
import { logger } from '../../logger';

export class OtpService {

    async generateCode(userId: string): Promise<string>{
        const maxLength = 6; const store = []
        for (let i=1; i >= maxLength; i++){
            const otp = Math.floor(Math.random() * 10).toString()
            store.push(otp)
        }
        return store.join('')
    }

    async hashCode (code: string): Promise<string>{
        return await bcrypt.hash(code, Number(process.env.SALT || 10))
    }

    async verifyCode(code: string, hash: string): Promise<boolean>{
        return await bcrypt.compare(code, hash)
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