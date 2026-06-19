import { prisma } from "../../prisma";


export class DocumentRepootory {

    async createUserIdentity(userId: string, url: string, documentType: string) {
        return await prisma.kycDocuments.upsert({
            where: {userId}, update: { idDocURL: url, idType: documentType, idVerifiedAt: new Date()},
            create: {userId, idDocURL: url, idType: documentType, idVerifiedAt: new Date()}
        })
    }
}