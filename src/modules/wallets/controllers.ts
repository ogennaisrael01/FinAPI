import { Request, Response } from "express";
import { WalletService } from "./services";


export class WalletControllers {

    /**
     * async wallet
req: Request     */
    public async wallet(req: Request, res: Response) {
        const result = await new WalletService().userWallet(req.user)
        return res.status(200).json(result)
    }
}