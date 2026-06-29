import { treeifyError } from "zod";
import { prisma } from "../../prisma";
import { VirtualAccount } from "./types";



export class WalletRepository {

    public async createVirtualAccount(userId: string, data: VirtualAccount) {
        return await prisma.virtualAccounts.upsert({
            where: {userId: userId}, update: data, create: data
        })
    }

    /**
     * createWallet
userId: string, defaultAmount: int = 0     */
    public async createWallet(userId: string, defaultAmount: number = 0) {
        return await prisma.wallet.create({
            data: { userId: userId, balance: defaultAmount}
        })
    }

    /**
     * findByUserId
userId: string     */
    public async findByUserId(userId: string) {
        return await prisma.wallet.findFirst({
            where: {userId}, 
            include: {user: {select: {
                id: true, firstName: true, lastName: true, middleName: true,
                email: true, phone: true, kycTier: true, phoneVerified: true, 
                emailVerified: true, bvnVerified: true, ninVerified: true,
                flwCustomerId: true, profilePhotoUrl: true, virtualAccount: true
            }}}
        })
    }
}