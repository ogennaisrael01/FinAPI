import { prisma } from "../prisma";
import { logger } from "../logger";
import { termiiService } from "../providers/termii/state";


export async function processSMS(userId: string, code: string) {
    const user = await prisma.user.findFirst({ where: { id: userId }, select: {phone: true}})
    // if not user fail the job
    if (!user) {
        throw new Error(`User with id ${userId} not found`)
    }
    // send sms to user.phone
    logger.info(`Sending SMS to ${user.phone.slice(0, 3)}....`)
    try{
        termiiService.sendMessage(user.phone, code, "dnd")
    }
    catch (err: any){
        throw new Error(err.message)
    }
}