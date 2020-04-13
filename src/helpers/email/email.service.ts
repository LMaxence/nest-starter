import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import {
  createTransport,
  Transporter,
  SendMailOptions,
  SentMessageInfo,
} from 'nodemailer';
import * as path from 'path';
import * as ejs from 'ejs';

@Injectable()
export class EmailService implements OnModuleInit {
  transporter: Transporter;
  TEMPLATES_PATH = path.join(__dirname, '..', '..', '..', 'templates');

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    if (process.env.NODE_ENV !== 'test') {
      this.transporter = createTransport({
        host: this.configService.get('NODEMAILER_HOST'),
        port: parseInt(this.configService.get('NODEMAILER_PORT')),
        auth: {
          user: this.configService.get('NODEMAILER_USER'),
          pass: this.configService.get('NODEMAILER_PASS'),
        },
      });
    }
  }

  async sendMail(
    emailOptions: SendMailOptions,
    templateName: string,
    data: any,
  ): Promise<SentMessageInfo> {
    emailOptions.html = await ejs.renderFile(
      path.join(this.TEMPLATES_PATH, templateName),
      { data },
    );
    // Never send mails in test environment
    return this.transporter && (await this.transporter.sendMail(emailOptions));
  }
}
