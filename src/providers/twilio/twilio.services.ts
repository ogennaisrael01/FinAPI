import { logger } from "../../logger"
import twilio from "twilio";


export class MessagingService {
    private apiKey: string; private phoneNumber: string
    private senderId: string

    constructor(apiKey: string, phoneNumber: string, senderId: string){
        this.apiKey = apiKey; this.phoneNumber = phoneNumber
        this.senderId = senderId
    }

    async sendMessage(phoneNumber: string, code: string, channel: string){
        try {
            logger.debug("Sending message to user", {meta: phoneNumber.slice(0, 3) + "....."})
            const tClient = await this.twilioClient()
            const payload = {
                to: phoneNumber, from: this.phoneNumber,
                body: `[FinApp Dev] Your verification code is ${code}. It expires in 5 minutes.`, 
            }
            // send message using twilio client
            const message = await tClient.messages.create(payload)
            return  message.sid
        } catch (error: any) {
            logger.error("Error sending message:", {error: error})
            throw new Error("Failed to send message")
        }
    }

    async twilioClient(){
        return twilio(this.senderId, this.apiKey)
    }
}