import { Injectable } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import {
  createTransport,
  Transporter,
  SendMailOptions,
  SentMessageInfo,
} from 'nodemailer';

@Injectable()
export class EmailService {
  transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: configService.get('NODEMAILER_HOST'),
      port: parseInt(configService.get('NODEMAILER_PORT')),
      auth: {
        user: configService.get('NODEMAILER_USER'),
        pass: configService.get('NODEMAILER_PASS'),
      },
    });
  }

  async sendMail(emailOptions: SendMailOptions): Promise<SentMessageInfo> {
    return await this.transporter.sendMail(emailOptions);
  }
}
