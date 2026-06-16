import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { logger } from "./logger";

function getDB(){
    logger.debug("Creating Database Connection")
    try{
        const globalForPrisma = global as unknown as {prisma: PrismaClient}
        const prismaClient = new PrismaClient({
            adapter: new PrismaPg({connectionString: process.env.DATABASE_URL})
        }) || globalForPrisma.prisma

        const node_env = process.env.NODE_ENV
        if (node_env !== "production") globalForPrisma.prisma = prismaClient // reuse connection 
        
        return prismaClient
    }
    catch (err: any){
        logger.error(`Error: ${err.message}`, {error: err});
        throw new Error(err.message)
    }
}

export const prisma = getDB()
