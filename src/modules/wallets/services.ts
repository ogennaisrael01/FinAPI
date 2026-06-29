import { User } from "../../../generated/prisma/client";
import { WalletRepository } from "./repository";

export class WalletService {

    /**
     * userWallet
user: User     */
    public async userWallet(user: User) {
        const wallet = await new WalletRepository().findByUserId(user.id)
        return wallet ? wallet : "Wallet is null, try contacting support to help assign a wallet to your account"
    }

}