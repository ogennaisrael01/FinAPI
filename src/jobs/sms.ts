import { prisma } from "../prisma";
import { logger } from "../logger";
import { termiiService } from "../providers/twilio/state";


export async function processSMS(phone: string, code: string) {
    // send sms to user.phone
    logger.info(`Sending SMS to ${phone.slice(0, 3)}....`)
    try{
        termiiService.sendMessage(phone, code, "dnd")
    }
    catch (err: any){
        logger.debug(err.message)
        throw new Error(err.message)
    }
}