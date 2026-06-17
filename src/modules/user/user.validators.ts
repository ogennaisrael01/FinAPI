import * as z from "zod";
import phone from "phone";


export function validatePhone(phoneNumber: string){
    const result = phone(phoneNumber, {country: "NGN"})
    return result.isValid
}

const message = "must contain only numbers";
export const registerSchema = z.object({
    phone: z.string().nonempty().regex(/^\d+$/, {message: message}),
    password: z.string().min(6).max(6).regex(/^\d+$/, {message: message})
})