import { queueConfig, queueProcessors } from '@/constants/queue';
import { IMailTemplateConfig } from '@/shared/types';
import { IQueueMailPayload } from '@/shared/types/mail.interface';
import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const processorsKey = queueProcessors.MAIL_QUEUE;

@Injectable()
@Processor(processorsKey)
export class MailService {
  private readonly nodemailer: typeof nodemailer = require('nodemailer');
  private readonly templatesDir = __dirname + 'templates';
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private configService: ConfigService) {
    this.transporter = this.nodemailer.createTransport({
      host: this.configService.get('email.host'),
      port: this.configService.get('email.port'),
      secure: true,
      auth: {
        user: this.configService.get('email.account'),
        pass: this.configService.get('email.password'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendMailWithTemplate(config: IMailTemplateConfig) {
    const sendMailPayload: Mail.Options = {
      from: config.from ? config.from : this.configService.get('email.account'),
      to: config.to,
      subject: config.subject,
    };

    if (config.template) {
      const templateDir = `${this.templatesDir}/${config.template.name}.hbs`;
      const template = fs.readFileSync(templateDir, 'utf-8');
      const compiledTemplate = handlebars.compile(template);
      const html = compiledTemplate(config.template.context);
      sendMailPayload.html = html;
    }
    if (config.text) {
      sendMailPayload.text = config.text;
    }

    try {
      this.transporter.sendMail(sendMailPayload);
      console.log('send success');
    } catch (e) {
      console.log('send mail error');
    } finally {
    }
  }

  @Process(queueConfig[processorsKey].MAIL_QUEUE_SUBSCRIBE_CREATE_CONTENT)
  async sendNotifyMail(data: IQueueMailPayload) {
    this.sendMailWithTemplate({
      to: data.emailReceive,
      subject: data.title,
      text: data.description,
      template: {
        name: 'email-notify-template',
        context: { ...data.context, page_title: 'Test test Page' },
      },
    });
  }

  @Process('test')
  async sendNotifyMailUpdate() {
    console.log('test');
  }
}
