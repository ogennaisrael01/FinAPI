import { MessagingService } from "./twilio.services";
import "dotenv/config";

export const termiiService = new MessagingService(
    process.env.TWILIO_AUTH_TOKEN as string,
    process.env.TWILIO_PHONE_NUMBER as string,
    process.env.TWILIO_ACCOUNT_SID as string
)