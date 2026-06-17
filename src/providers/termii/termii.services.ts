import { logger } from "../../logger"
import axios from "axios"


export class MessagingService {
    private apiKey: string; private baseUrl: string
    private senderId: string

    constructor(apiKey: string, baseUrl: string, senderId: string){
        this.apiKey = apiKey; this.baseUrl = baseUrl
        this.senderId = senderId
    }

    async sendMessage(phoneNumber: string, code: string, channel: string){
        try {
            logger.debug("Sending message to user", {meta: phoneNumber.slice(0, 3) + "....."})

            const url = await this.url("/api/sms/send")
            const payload = {
                to: phoneNumber, from: this.senderId,
                sms: `Your OTP code is ${code}`, type: "plain",
                api_key: this.apiKey, channel: channel
            }
            // send message using axios   
                const response = await axios.post(url, payload)
                return response.data
        } catch (error: any) {
            logger.error("Error sending message:", {error: error})
            throw new Error("Failed to send message")
        }
    }

    async url(path: string){
        const baseUrl = this.baseUrl
        return `${baseUrl}${path}`.trim()
    }
}