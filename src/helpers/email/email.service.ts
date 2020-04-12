import { Injectable } from '@nestjs/common';
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
export class EmailService {
  transporter: Transporter;
  TEMPLATES_PATH = path.join(__dirname, '..', '..', '..', 'templates');

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

  async sendMail(
    emailOptions: SendMailOptions,
    templateName: string,
    data: any,
  ): Promise<SentMessageInfo> {
    emailOptions.html = await ejs.renderFile(
      path.join(this.TEMPLATES_PATH, templateName),
      { data },
    );
    return await this.transporter.sendMail(emailOptions);
  }
}
