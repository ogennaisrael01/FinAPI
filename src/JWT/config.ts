import crypto from "crypto"
import { User } from "../../generated/prisma/browser";
import { tokenState } from "./state";
import { tokenTypes } from "./types";
import { JWTRepository } from "./jwt.repository";

export class RefreshToken { 

    async forUser(user: User){
        const jti = crypto.randomUUID()
        const token = await tokenState.encodeToken(user.id, jti, tokenTypes.RefreshToken)
        const expiresAt = new Date()
        expiresAt.setTime(expiresAt.getTime() + 7*24*60*60*1000) // set expiration to 7 days from now
        await new JWTRepository().outstandToken(user.id, jti, token, expiresAt)
        return token
    }

    async blacklistToken(tokenId: string){
        await new JWTRepository().blacklistToken(tokenId)
    }

    async isBlacklisted(jti: string){
        const blacklisted = await new JWTRepository().findBlacklist(jti)
        return !!blacklisted
    }
}

export class AccessToken {

    async forUser(user: User){
        const jti = crypto.randomUUID()
        const token = await tokenState.encodeToken(user.id, jti, tokenTypes.AccessToken)
        return token
    }
}

export async function issueToken(user: any){
    const refreshToken = await new RefreshToken().forUser(user)
    const accessToken = await new AccessToken().forUser(user)
    return {accessToken, refreshToken}
}

