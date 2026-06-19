import { logger } from "../logger"
import { MessageManager } from "../providers/brevo/brevo.services"

export const processEmail = async (email: string, code: string) => {
        try{
            const messageManager = new MessageManager()
            await messageManager.sendEmail(code, email)
        }
        catch (error: any){
            logger.debug(error.message)
            throw new Error(error)
        }
}