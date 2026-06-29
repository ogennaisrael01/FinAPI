import { prisma } from "../../prisma";


export class DocumentRepository {

    async createUserIdentity(userId: string, url: string, documentType: string) {
        return await prisma.kycDocuments.upsert({
            where: {userId}, update: { idDocURL: url, idType: documentType, idVerifiedAt: new Date()},
            create: {userId, idDocURL: url, idType: documentType, idVerifiedAt: new Date()}
        })
    }

    async updateDocument(userId: string, data: Record<string,any>){
        return await prisma.kycDocuments.update({
            where: {userId}, data: data
        })
    }
}