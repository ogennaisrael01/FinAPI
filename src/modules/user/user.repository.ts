import { treeifyError } from "zod";
import { prisma } from "../../prisma";


export class UserRepository {

    async createUser(phone: string, passwordHash: string) {
        // create user using phone and password
        return await prisma.user.create({data: {phone: phone, passwordHash: passwordHash}})
    }
    async findUserByPhone(phone: string){
        return prisma.user.findFirst({where: {phone: phone}})
    }
    async findUserByEmail(email: string){
        return prisma.user.findFirst({where: {email: email}})
    }
    async updateUser(userId: string, data: any){
        return await prisma.user.update({where: {id: userId}, data: data})
    }

    async findUserById(userId: string){
        return prisma.user.findFirst({
            where: { id: userId}, 
            select: {
                virtualAccount: true, id: true, kycTier: true, 
                firstName: true, lastName: true, phone: true, middleName: true, 
                gender: true, email: true, address: true, profilePhotoUrl: true,
                phoneVerified: true, emailVerified: true, bvnVerified: true, ninVerified: true
            },
        })
    }

}

