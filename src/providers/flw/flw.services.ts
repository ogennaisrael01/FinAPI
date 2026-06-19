import axios from "axios"
import { createCustomerType } from "./types"
import { logger } from "../../logger"
import { response } from "express"
import { UserDefinedMessageSubscriptionInstance } from "twilio/lib/rest/api/v2010/account/call/userDefinedMessageSubscription"

export class FlutterWave {
    private baseUrl: string = ""
    private cachedAccessToken: string | null = null
    private expiryTime:  number = 0
    private clientId: string = ""
    private clientSecretKey: string = ""

    constructor ( baseUrl: string, clientId: string, clientSecretKey: string){
        this.baseUrl = baseUrl
        this.clientId = clientId 
        this.clientSecretKey = clientSecretKey
    }
    async getAccessToken(){
        const currentTime = Date.now();
        // Reuse token is it has more than 30 seconds left
        if ( this.cachedAccessToken && this.expiryTime - currentTime > 3000){
            return this.cachedAccessToken
        }
        const response = await axios.post(
            process.env.GET_TOKEN_URL as string, 
            new URLSearchParams({
                client_id: this.clientId, client_secret: this.clientSecretKey,
                grant_type: 'client_credentials'
            }), {headers: { 'Content-Type': 'application/x-www-form-urlencoded' }}
        )
        const token = typeof response.data === "object" ? response.data.access_token : ""
        this.cachedAccessToken = token
        this.expiryTime = response.data.expires_in
        return token

    }
    async getHeaders(idempotencyKey: string){
        return { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${await this.getAccessToken()}`,
            "Idempotency-Key": idempotencyKey

        }
    }
    async url(path: string){
        return `${this.baseUrl}/${path}`.trim()
    }

    async createCustomer(userData: createCustomerType, idempotencyKey: string){
        logger.debug("Creating account for customer", {meta: { userId: userData.userId}})
        const payload = {
            address: userData.address,
            email: userData.email,
            user: {first: userData.firstName, last: userData.lastName, middle: userData.middleName},
            phone: {
                country_code: userData.phone.substring(0, 4).replace("+", ""),
                number: userData.phone.substring(4)
            },
            meta: {
                userId: userData.userId
            }
        }
        const url = await this.url("customers")
        const headers = await this.getHeaders(idempotencyKey)
        try{
            const response =  await axios.post(url, payload, {headers: headers})
            return response.data
        }
        catch (error: any){
            logger.error(`Failed to process request with status code: ${error.response?.status}, \nReason: ${JSON.stringify(error.response.data.error)}`)
            const code = error.response.data.error?.code

            if (code === "10409"){
                // search for the user
                logger.debug("Searching for user "+ userData.email)
                const url = await this.url("customers/search")
                const response = await axios.post(url, {email: userData.email}, {headers})
                const data = response.data.data.find((d: any) => d.email === userData.email)
                return data
            }

            throw new Error(error.message)
        }
    }

}