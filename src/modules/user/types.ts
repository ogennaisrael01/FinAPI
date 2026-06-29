
export const  VerificationTypes =  {
    phone_verification: "phone_verification",
    password_reset: "password_reset",
    email_verification: "email_verification",
}


export interface Tiers {
    maxTransactionLimit: number
    maxAccountBalance: number
}

export function fetchAccountLimits(): Record<string, Tiers>{
    return {
        tier1: { 
            maxAccountBalance: 200_000,
            maxTransactionLimit: 50_000
        },
        tier2: {
            maxAccountBalance: 500_000,
            maxTransactionLimit: 200_000
        },
        tier3: {
            maxAccountBalance: 1_000_000_000_000,
            maxTransactionLimit: 5_000_000
        }
    }
}