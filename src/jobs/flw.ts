import { logger } from "../logger";
import { UserRepository } from "../modules/user/user.repository";
import { createCustomerType } from "../providers/flw/types";
import { createCustomerData } from "../queue/types";
import { flw } from "../providers/flw/state";


export async function processCreateCustomer(data: createCustomerData) {
    const user = await new UserRepository().findUserById(data.userId)
    if (!user){
        logger.error("user not found to create customer")
        throw new Error('user not found')
    }
    const address = typeof user.address === 'object' && user.address && !Array.isArray(user.address) ? user.address as Record<any, any> : undefined
    const userData: createCustomerType = {
        userId: data.userId,
        email: user.email as string,
        firstName: user.firstName as string,
        lastName: user.lastName as string,
        middleName: user.middleName as string,
        address: { 
            city: address?.city as any, country: address?.country,
            line1: address?.location, state: address?.state, line2: address?.address, 
            postal_code: address?.postalCode
        },
        phone: user.phone
    }
    const response = await flw.createCustomer(userData, data.idempotencyKey)
    const customerId = response?.id
    // update flutterwave customer ID in DB and tier to 1
    await new UserRepository().updateUser(user.id, {flwCustomerId: customerId, kycTier: 1})

    return user
}