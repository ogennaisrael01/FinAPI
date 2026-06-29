import axios from "axios";
import { setting } from "../../settings";
import { logger } from "../../logger";
import { User } from "../../../generated/prisma/browser";
import { createAccount, generateUniqueReference } from "./types";
import { stat } from "node:fs";
import { timeStamp } from "node:console";
import { UserRepository } from "../../modules/user/user.repository";

export class Monnify {
    private cachedAccessToken: string | null = null
    private expiresIn: number 
    constructor (){
        this.cachedAccessToken = null
        this.expiresIn = 0
    }

    private saveTokens(data: Record<string, any>){
        this.cachedAccessToken = data.accessToken
        this.expiresIn = data.expiresIn
    }

    private async getAccesToken () {

        const currentDate = Date.now()

        if (this.cachedAccessToken && this.expiresIn - currentDate > 3000){
            logger.debug("Using cached authorization token to process request")
            return this.cachedAccessToken
        }

        logger.debug("Creating new token to process request")
        const credentials = `${setting.PAY_MONNIFY_API_KEY}:${setting.PAY_MONNIFY_SECRET_KEY}`
        const encoded = Buffer.from(credentials).toString("base64")

        
        try{
            const headers = {Authorization: `Basic ${encoded}`}
            const url = this.url("api/v1/auth/login")
            const response = await axios.post(url, {}, {headers: headers})
            const { requestSuccessful, responseBody, responseMessage } = response.data;

            if (!requestSuccessful) {
                throw new Error(`Monnify auth failed: ${responseMessage}`);
            }
            this.saveTokens(responseBody)
            return responseBody.accessToken;
        }
        catch (error: any){
            logger.error("Failed to authenticate user", {meta: {error}})
            throw new Error(error.message)
        }
    }

    private async headers(): Promise<{}> {
        const access_token = await this.getAccesToken()
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access_token}`
        }
    }
    private url(path: string) {
        return `${setting.PAY_MONNIFY_BASE_URL}/${path}`.trim()
    }

    private async userData (user: User, bvn: string): Promise<createAccount>{
        const userName = `${user.firstName} ${user.middleName} ${user.lastName}`
        const reference = "OGEN-bc21730c-896b-4d4f-8951-ca258df12751"
        await new UserRepository().updateUser(user.id, {flwCustomerId: reference})

        return {
            accountReference: user.flwCustomerId as string,
            accountName: userName, currencyCode: "NGN",
            contractCode: setting.PAY_MONNIFY_CONTRACT_CODE,
            customerEmail: user.email as string, customerName: userName,
            bvn: bvn, getAllAvailableBanks: true, preferredBanks: ["50515"]
        }
    }

    /**
     * createDedicatedAccount
user: User, bvn: string   
    */
    public async createDedicatedAccount(user: User, bvn: string) {

        const headers = await this.headers()
        const url = this.url("api/v2/bank-transfer/reserved-accounts")
        const data = await this.userData(user, bvn)
        try{
            const response = await axios.post(url, data, {headers: headers})
            const { requestSuccessful, responseMessage } = response.data;
 
            if (!requestSuccessful){
                logger.error(responseMessage)
                throw new Error(responseMessage)
            }
            return response.data
        }
        catch (error: any){
            const status: number = error?.status
            if (status === 422 ) {
               // duplicate account for this customer  ( Fetch the account instead)
                logger.debug("fetching reserved account", {meta: {ref: data.accountReference, userAccount: user.flwCustomerId}})
                const url = this.url(`api/v2/bank-transfer/reserved-accounts/${user.flwCustomerId}`)
                const response = await axios.get(url, {headers: headers})
                return response.data
            }

            throw new Error(error.message)
        }
    }

    /**
     * verifyBvn
bvn: string, user: User     */
    public async verifyBvn(bvn: string, user: User) {
        
        // return mock data only since api is only available in live environment
        return {
            "requestSuccessful": true,
            "responseMessage": "success",
            "responseCode": "0",
            "responseBody": {
                "bvn": bvn,
                "name": {
                "matchStatus": "FULL_MATCH",
                "matchPercentage": 100
                },
                "dateOfBirth": "NO_MATCH",
                "mobileNo": "FULL_MATCH"
            }
        }
    }

}