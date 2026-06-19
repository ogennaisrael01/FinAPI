import { prisma } from "../prisma";
import { logger } from "../logger";
import { termiiService } from "../providers/twilio/state";


export async function processSMS(userId: string, code: string) {
    const user = await prisma.user.findFirst({ where: { id: userId }, select: {phone: true}})
    // if not user fail the job
    if (!user) {
        logger.debug(`User not found to complete job`)
        throw new Error(`User with id ${userId} not found`)
    }
    // send sms to user.phone
    logger.info(`Sending SMS to ${user.phone.slice(0, 3)}....`)
    try{
        termiiService.sendMessage(user.phone, code, "dnd")
    }
    catch (err: any){
        logger.debug(err.message)
        throw new Error(err.message)
    }
}