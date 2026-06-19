import { prisma } from "../../prisma"

export class OtpRepository {

    async createOTP(userId: string, type: string, otpHash: string, expiresAt: Date) {
        return await prisma.otpCodes.create({data: {userId, type, otpHash, expiresAt}})
    }

    async findOtpByCode(code: string){
        return await prisma.otpCodes.findFirst({ where: { otpHash: code }, include: { user: { select: { id: true } } } })
    }

    async incrementAttempts(otpId: string){
        return await prisma.otpCodes.update({where: {id: otpId}, data: {attempts: {increment: 1}}})
    }
    async invalidateOtp(otpId: string){
        return await prisma.otpCodes.update({where: {id: otpId}, data: {isUsed: true, usedAt: new Date()}})
    }
}