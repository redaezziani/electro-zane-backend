// src/common/services/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendTestEmail(
    to: string,
    subject = 'Test Email',
    text = 'Test email from Sky-S Application',
  ) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        text,
      });
      this.logger.log(`Test email sent to ${to}`);
    } catch (error: any) {
      this.logger.error(`Failed to send test email: ${error.message}`);
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (error: any) {
      this.logger.error(`Failed to send email: ${error.message}`);
    }
  }
}
