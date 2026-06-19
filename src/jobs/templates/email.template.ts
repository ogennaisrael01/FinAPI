

export function emailVerificationBody(email: string, code: string){
    const body = `<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <title>Verify Your Email Address</title>
                <style>
                /* Reset styles for email clients */
                body, table, td, a { text-size-adjust: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse !important; }
                body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
                img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

                /* Custom styles */
                .email-container { max-width: 570px; margin: 0 auto; padding: 40px 20px; }
                .card { background-color: #ffffff; border-radius: 12px; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                .logo { font-size: 22px; font-weight: 700; color: #4f46e5; text-align: center; margin-bottom: 30px; letter-spacing: -0.5px; }
                .heading { font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; text-align: center; }
                .text { font-size: 15px; line-height: 24px; color: #475569; margin-top: 0; margin-bottom: 24px; text-align: center; }
                .highlight-email { color: #0f172a; font-weight: 600; }

                /* Code block styling */
                .code-container { background-color: #f1f5f9; border-radius: 8px; padding: 18px; text-align: center; margin-bottom: 24px; border: 1px dashed #cbd5e1; }
                .verification-code { font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; color: #4f46e5; letter-spacing: 6px; padding-left: 6px; }

                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8; line-height: 18px; }
                .footer a { color: #4f46e5; text-decoration: none; }
                </style>
                </head>
                <body>

                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                <td align="center">
                    <div class="email-container">
                    
                    <!-- Optional App Branding/Logo -->
                    <div class="logo">
                        ⚡ FinAPI
                    </div>
                    
                    <!-- Main Content Card -->
                    <div class="card">
                        <h1 class="heading">Verify your email address</h1>
                        
                        <p class="text">
                        Thank you for signing up! Please use the verification code below to verify the account created for <span class="highlight-email">${email}</span>.
                        </p>
                        
                        <!-- Verification Code Block -->
                        <div class="code-container">
                        <span class="verification-code">${code}</span>
                        </div>
                        
                        <p class="text" style="font-size: 13px; color: #64748b; margin-bottom: 0;">
                        This code is short lived. If you did not request this email, you can safely ignore it.
                        </p>
                    </div>
                    
                    <!-- Email Footer -->
                    <div class="footer">
                        <p>Sent by FinAPI., 123 Building Tech, Tech</p>
                    </div>
                    
                    </div>
                </td>
                </tr>
            </table>

            </body>
            </html>
    `
    return body
}