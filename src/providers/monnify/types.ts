
export interface createAccount {
     accountReference: string
    accountName: string
    currencyCode: string
    contractCode: string
    customerEmail: string
    customerName: string
    bvn: string
    getAllAvailableBanks: boolean
    preferredBanks: Array<string>
}

export function generateUniqueReference(username: string){
    // extract the first four letters from username
    const append = username ? username.slice(0, 4).toUpperCase() : "REFE"
    return append + "-" + crypto.randomUUID()
}  