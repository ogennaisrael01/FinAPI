import { prisma } from "../../prisma";


export class UserRepository {

    async createUser(phone: string, passwordHash: string) {
        // create user using phone and password
        return await prisma.user.create({data: {phone: phone, passwordHash: passwordHash}})
    }
    async findUserByPhone(phone: string){
        return prisma.user.findFirst({where: {phone: phone}})
    }
    async updateUser(userId: string, data: any){
        return await prisma.user.update({where: {id: userId}, data: data})
    }

    async findUserById(userId: string){
        return prisma.user.findFirst({where: { id: userId}})
    }

}

