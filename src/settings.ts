import "dotenv/config"

class Setting {
    // a base class to load env variables
    public PAY_MONNIFY_BASE_URL: string
    public PAY_MONNIFY_SECRET_KEY: string
    public PAY_MONNIFY_CONTRACT_CODE: string
    public PAY_MONNIFY_API_KEY: string
    
    constructor (){
        this.PAY_MONNIFY_API_KEY = process.env.PAY_MONNIFY_API_KEY as string
        this.PAY_MONNIFY_BASE_URL = process.env.PAY_MONNIFY_BASE_URL as string
        this.PAY_MONNIFY_CONTRACT_CODE = process.env.PAY_MONNIFY_CONTRACT_CODE as string
        this.PAY_MONNIFY_SECRET_KEY = process.env.PAY_MONNIFY_SECRET_KEY as string
    }
}

export const setting = new Setting()