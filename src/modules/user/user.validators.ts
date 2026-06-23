import * as z from "zod";
import phone from "phone";


export function validatePhone(phoneNumber: string){
    const result = phone(phoneNumber)
    return result
}

const message = "must contain only numbers";
export const registerSchema = z.object({
    phone: z.string().nonempty(),
    password: z.string().min(6).max(6).regex(/^\d+$/, {message: message})
})

export const userVerificationSchema = z.object({
    code: z.string().min(6).max(6).regex(/^\d+$/, {message: message}),
    type: z.string().nonempty()
})

export const emailVerificationSchema = z.object({
    email: z.string().nonempty().min(6)
})


export const onboardingSchema = z.object({
    email: z.string().nonempty(),
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
    middleName: z.string().nonempty(),
    gender: z.string().nullable(),
    DOB: z.iso.date().nullable(),
    address: z.object({
        country: z.string().nonempty(),
        state: z.string().nonempty(),
        city: z.string().nonempty(),
        LGA: z.string().nonempty(),
        location: z.string().nonempty(),
        address: z.string().nullable(),
        postalCode: z.string().nonempty()
    }),
    userIdentity: z.object({
        type: z.string().nonempty()
    })
})

export const loginSchema = z.object({
    phone: z.string().nonempty(),
    password: z.string().regex(/^\d+$/, "secure integer only").min(6).max(6).nonempty()
})

export const bvnVerificationSchema = z.object({
    bvn: z.string().min(11).max(11).regex(/^\d+$/, "secure integer only")
})

export const TransactionPinSchema = z.object({
    pin: z.string().min(4).max(4).regex(/^\d+$/, "secure integer only")
})
