

export interface createCustomerType {
    userId: string,
    email: string
    firstName?: string
    lastName?: string
    middleName?: string
    address: {
        city: string, country: string,
        state: string, line1: string,
        line2?: string, postal_code: string
    },
    phone: string
}

export interface createVirtualAccount {
    currency: string,
    account_type: string,
    reference: string,
    customer_id : string,
    amount: number
}