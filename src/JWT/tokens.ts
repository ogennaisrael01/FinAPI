import { sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken';
import { tokenTypes } from './types';
import { logger } from '../logger';

export class Token {
    private SecretKey: string;
    private Algorithm: Algorithm;
    private accessTokenTTL: string;
    private refreshTokenTTL: string

    constructor (secretKey: string, Algorithm: Algorithm,
        accessTokenTTL: string, refreshTokenTTL: string
        ){
        this.SecretKey = secretKey,
        this.Algorithm = Algorithm,
        this.accessTokenTTL = accessTokenTTL,
        this.refreshTokenTTL = refreshTokenTTL
    }

    async encodeToken(userId: string, jti: string, tokenType: string){
        logger.debug("Encoding token", {meta: {userId, jti, tokenType}});

        const expiresIn = tokenType === tokenTypes.RefreshToken ? this.refreshTokenTTL : this.accessTokenTTL
        const payload = { userId, jti }
        const token = sign(payload, this.SecretKey, { 
            expiresIn: expiresIn as string, 
            algorithm: this.Algorithm as unknown} as SignOptions)

        return token
    }

    async decodeToken(token: string){
        logger.debug("Decoding token", {meta: token.slice(0, 10)});
        try{
            const payload = verify(token, this.SecretKey, {
                algorithms: this.Algorithm as unknown} as VerifyOptions
            )
            return payload
            
        }
        catch (err: any){
            logger.error("Token decoding failed", {meta: {error: err.message}});
            throw new Error("Invalid token: "+ err.message)
        }

    }
}

