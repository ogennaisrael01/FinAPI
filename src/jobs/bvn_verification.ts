import { logger } from "../logger";
import { DocumentRepository } from "../modules/kycDocuments/kyc.repositories";
import { UserRepository } from "../modules/user/user.repository";
import { UserService } from "../modules/user/user.services";
import { monnify } from "../providers/monnify/state";
import { BVNJobData } from "../queue/types";
import { processCreateVirtualAccount } from "./payments";


export async function processBVNverification(data: BVNJobData) {
    const user = await new UserRepository().findUserById(data.userId)
    const bvn = data.bvn    
    const { requestSuccessful, responseBody, responseMessage } = await monnify.verifyBvn(bvn, user as any)

    logger.debug(`info from bvn verification: ${responseMessage}`, {meta: responseBody})

    if (requestSuccessful){
        await processCreateVirtualAccount(user?.id as string, bvn)

        const userUpdateData = {kycTier: user?.kycTier === 1 ? 2 : 1, bvnVerified: true}
        await new UserRepository().updateUser(user?.id as string, userUpdateData)
        // update kyc document
        const hashedBvn = await new UserService().setPassword(bvn)
        const documentData = {bvnEncrypted: hashedBvn, bvnVerifiedAt: new Date()}
        await new DocumentRepository().updateDocument(user?.id as string, documentData)

        return true
    }
    
}