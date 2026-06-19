import { Request, Response } from "express";
import { UserService } from "./user.services";

export class UserControllers {

    async register(req: Request, res: Response){
        try{
            const result = await new UserService().registerUser(req)
            res.status(201).json(result)
        }
        catch (err: any){
            res.status(400).json({error: err.message})
        }
    }

    async verify(req: Request, res: Response){
        // verification router for both the phone verification and email verification
        try{
            const result = await new UserService().userVerification(req)
            return res.status(200).json(result)
        }
        catch (error: any){
            const statusCode = error.message === "Max OTP attempts reached" ? 429 : 400
            return res.status(statusCode).json({error: error.message})
        }
    }

    async verificationEmail(req: Request, res: Response){
        try{
            const result = await new UserService().verificationEmail(req)
            return res.status(200).json(result)
        }
        catch (error: any){
            return res.status(400).json({error: error})
        }
    }

    async onboard(req: Request, res: Response){
        try{

            const result = await new UserService().completeProfile(req)
            return res.status(200).json(result)
        }
        catch (error: any){
            // return general 400 bad request error
            return res.status(400).json({error: error.message})
        }
    }

    async login(req: Request, res: Response){
        try{
            const result = await new UserService().getToken(req)
            return res.status(200).json(result)
        }
        catch(error: any){
            return res.status(400).json({errors: error.message})
        }
    }
}