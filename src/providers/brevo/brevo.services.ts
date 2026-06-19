import nodemailer from "nodemailer";
import { emailVerificationBody } from "../../jobs/templates/email.template";
import { logger } from "../../logger";

export class MessageManager {

    async nodeClient(){
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT) || 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })
    }

    async getBody(code: string, email: string){
        return emailVerificationBody(email, code)
    }

    async sendEmail(code: string, email: string){
        logger.debug("Preparing to send email", {meta: `Email: ${email}, Code: ${code}`})
        
        const transporter = await this.nodeClient()
        const subject = `[FInAPI] Your OTP Verification Code`
        const html = await this.getBody(code, email)
        await transporter.sendMail({
            from: process.env.SMTP_EMAIL_FROM, to: email,
            subject, html
        })
    }
}
