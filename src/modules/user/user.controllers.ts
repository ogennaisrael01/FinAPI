import { Request, Response } from "express";
import { UserService } from "./user.services";

export class UserControllers {

    async register(req: Request, res: Response){
        const result = await new UserService().registerUser(req)
        res.status(201).json(result)
    }

    async verify(req: Request, res: Response){
        // verification router for both the phone verification and email verification
        const result = await new UserService().userVerification(req)
        return res.status(200).json(result)
      
    }

    async verificationEmail(req: Request, res: Response){
        const result = await new UserService().verificationEmail(req)
        return res.status(200).json(result)
    }

    async onboard(req: Request, res: Response){
        const result = await new UserService().completeProfile(req)
        return res.status(200).json(result)
    }

    async login(req: Request, res: Response){
        const result = await new UserService().getToken(req)
        return res.status(200).json(result)
    }

    async requestBvn(req: Request, res: Response){
        const result = await new UserService().bvnVerificationRequest(req)
        return res.status(200).json(result)
    }
    async setPin(req: Request, res: Response){
        const result = await new UserService().setTransactionPin(req)
        return res.status(200).json(result)
    }
}