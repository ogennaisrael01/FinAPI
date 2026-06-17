import { prisma } from "../../prisma";


export class UserRepository {

    async createUser(phone: string, passwordHash: string) {
        // create user using phone and password
        return await prisma.user.create({data: {phone: phone, passwordHash: passwordHash}})
    }
    async findUserByPhone(phone: string){
        return prisma.user.findFirst({where: {phone: phone}})
    }
}

