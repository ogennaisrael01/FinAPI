import { prisma } from "../prisma";


export class JWTRepository {

    async outstandToken(userId: string, jti: string, token: string, expiresAt: Date){
        return await prisma.outstandingToken.create({data: {userId, jti, token, expiresAt}})
    }

    async blacklistToken(tokenId: string){
        return await prisma.blacklistedToken.create({data: {tokenId}})
    }

    async findBlacklist(jti: string){
        return await prisma.blacklistedToken.findFirst({where: {token: {jti}}})
    }
}