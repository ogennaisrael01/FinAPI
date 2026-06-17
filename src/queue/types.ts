

export const JobNames = {
  SEND_EMAIL: 'send_email',
  SEND_SMS: 'send_sms',
  SEND_PUSH_NOTIFICATION: 'send_push_notification',
};

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
