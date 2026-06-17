import { MessagingService } from "./termii.services";
import "dotenv/config";

export const termiiService = new MessagingService(
    process.env.TERMII_API_KEY as string,
    process.env.TERMII_BASE_URL as string,
    process.env.TERMII_SENDER_ID as string
)