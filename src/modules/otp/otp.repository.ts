import { prisma } from "../../prisma"

export class OtpRepository {

    async createOTP(userId: string, type: string, otpHash: string, expiresAt: Date) {
        return await prisma.otpCodes.create({data: {userId, type, otpHash, expiresAt}})
    }
}