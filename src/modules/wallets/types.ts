
export interface VirtualAccount {
    userId: string
    accountNumber: string
    accountName: string
    bankName?: string
    bankCode: string
    monnifyRef?: string
}

export interface Accounts {
    bankCode: string
    bankName: string
    accountNumber: string
    accountName: string
}