export interface EmailData {
    to: string;
    subject: string;
    body: string;
    attachments?: {
      filename: string;
      content: string; // base64
      contentType: string;
    }[];
  }