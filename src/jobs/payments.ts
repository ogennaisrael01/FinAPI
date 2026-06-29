import { logger } from "../logger";
import { UserRepository } from "../modules/user/user.repository";
import { monnify } from "../providers/monnify/state";
import { Accounts, VirtualAccount } from "../modules/wallets/types";
import { WalletRepository } from "../modules/wallets/repository";


export async function processCreateVirtualAccount(userId: string, bvn: string) {
    const user = await new UserRepository().findUserById(userId)
    const { requestSuccessful, responseBody } = await monnify.createDedicatedAccount(user as any, bvn)
    try{
        let data: VirtualAccount;
        const accounts: Accounts[] = responseBody?.accounts
        // fetch the sterling bank account
        const account = accounts.find(acc => acc.bankCode === "232" && acc.bankName.startsWith("Sterling"))
        data = {
            userId: user?.id as string,
            accountName: account?.accountName as string,
            accountNumber: account?.accountNumber as string,
            bankCode: account?.bankCode as string,
            bankName: account?.bankName,
            monnifyRef: responseBody?.accountReference
        }
        await new WalletRepository().createVirtualAccount(user?.id as string, data)
        logger.debug("Virtual Account successfully created", { meta: data})
        return true
    }
    catch (error: any){
        logger.error("Virtual account Failed", {meta: error})
        throw new Error(error)
    }
}

