import axios from "axios"
import { createCustomerType, createVirtualAccount } from "./types"
import { logger } from "../../logger"
import { User } from "../../../generated/prisma/browser"
import { generateUniqueReference } from "./state"
import { ServerError } from "../../errors/AppError"

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
        // Reuse token if token still has more than 30 seconds left
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


    async createVirtualAccount(user: User, idempotencyKey: string){
        logger.debug("Creating virtual account for customers", {meta: {id: user.id?.slice(0, 4)}})
        
        
        const reference = generateUniqueReference(user.firstName ? user.firstName: "FIN")
        if (! user.flwCustomerId){
            throw new Error("FlutterWave customer ID cannot be null")
        }
        const payload: createVirtualAccount = {
            currency: "NGN",
            account_type: "static",
            reference: reference,
            customer_id: user.flwCustomerId,
            amount: 0
        }

        try{
            const url = await this.url("virtual-accounts")
            const headers = await this.getHeaders(idempotencyKey)
            const response = await axios.post(url, payload, {headers: headers})

            return response.data
        }

        catch(error: any){
            logger.error(`Failed  Reason: ${error.response.data.error.messagae}`)
            throw new Error(error)
        }
    }

    async requestBvnVerification(user: User, bvn: string){
        const payload = {
            bvn: bvn, firstname: "Nibby", lastname: "Certifier",
            // redirect_url: process.env.APP_BASE_URL + "/api/fin/bvn/verification"
        }
        const url = "https://api.flutterwave.com/v3/bvn/verifications"
        const headers = {"Authorization": `Bearer ${process.env.FLW_SECRET_KEY}`}
        try{
            const response = await axios.post(url, payload, {headers: headers})
            return response.data
        }
        catch (error: any){
            logger.error("error message",{ meta: error.response.data})
            throw new ServerError(error.message, error.response.data)
        }
    }

}