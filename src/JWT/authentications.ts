import { Request } from "express"
import { UserRepository } from "../modules/user/user.repository"
import { tokenState } from "./state"

export class JWTAuthentication {
    constructor (){}

    getHeaders (request: Request){
        // get authentication headers
        const authHeader = request.headers?.authorization
        if(!authHeader){
            throw new Error("Authentication credentials were not provided")
        }
        return authHeader
    }

    gettoken (header: any){
        const tokenSplit = header.split(" ")
        if (tokenSplit.length !== 2){
            throw new Error("Invalid Authorization headers")
        }
        const token = tokenSplit[1]
        return token
    }

    async getUser(validatedToken: any){
        const userId = validatedToken?.userId
        try{
            const user = await new UserRepository().findUserById(userId)
            if (!user)throw new Error("User Not Found")
            if(!user.phoneVerified) throw new Error("User phone number must be verified to get token")
            return user
        }
        catch (err: any){
            throw new Error(err.message)
        }
    }

    async authenticateUser(request: Request){
        const header = this.getHeaders(request)
        if (!header){
            throw new Error("Authentication credentials were not provided")
        }
        const token = this.gettoken(header)
        const decode = await tokenState.decodeToken(token)
        return await this.getUser(decode)
    }
}
