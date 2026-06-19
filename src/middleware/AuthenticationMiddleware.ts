import { JWTAuthentication } from "../JWT/authentications";
import { Request, Response, NextFunction } from "express"

declare global {
    namespace Express {
        interface Request {
            user?: any,
            token?: any
        }
    }
}

export const AuthenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    /// This middleware will check if the user is authenticated by verifying the access token in the Authorization header
    try{
        const user = await new JWTAuthentication().authenticateUser(req)
        req.user = user
        next()
    }
    catch (err: any){
        res.status(401).json({error: err.message})
    }
}
