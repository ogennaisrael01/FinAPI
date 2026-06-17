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
}