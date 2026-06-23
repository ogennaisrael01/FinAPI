

export const JobNames = {
  SEND_EMAIL: 'send_email',
  SEND_SMS: 'send_sms',
  SEND_PUSH_NOTIFICATION: 'send_push_notification',
  FILE_UPLOAD: "file_upload",
  FLW_CREATE_CUSTOMER: "create_customer",
  BVN_VERIFICATION: "bvn_verification"
};

export const fileTypes = {
    PROFILE_PICTURE: "profile_picture",
    KYC_DOCUMENT: "kyc_document"
}

export interface createCustomerData{
  userId: string, idempotencyKey: string
}

export interface FileJobData {
    userId: string, file: Express.Multer.File, type: string, idType: string
}

export interface BVNJobData {
  userId: string, bvn: string
}

interface SendEmailJobData {
  to: string;
  subject: string;
  body: string;
}

interface SendSMSJobData {
  to: string;
  message: string;
}

interface SendPushNotificationJobData {
  to: string;
  title: string;
  message: string;
}
