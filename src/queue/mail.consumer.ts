import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as fs from 'fs';
import handlebars from 'handlebars';
import { IMailTemplateConfig } from '@/interface';
import Mail from 'nodemailer/lib/mailer';
import { IQueueMailPayload } from '@/interface/mail.interface';
import { MAIL_QUEUE, MAIL_QUEUE_SUBSCRIBE_CREATE_CONTENT } from '@/constants';

@Processor(MAIL_QUEUE)
export class MailConsumer {
  private readonly emailAccount = process.env.EMAIL_ACCOUNT;
  private readonly emailPassword = process.env.EMAIL_PASSWORD;
  private readonly nodemailer: typeof nodemailer = require('nodemailer');
  private readonly templatesDir = 'templates';
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor() {
    this.transporter = this.nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.emailAccount,
        pass: this.emailPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendMailWithTemplate(config: IMailTemplateConfig) {
    const sendMailPayload: Mail.Options = {
      from: config.from ? config.from : this.emailAccount,
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

  @Process(MAIL_QUEUE_SUBSCRIBE_CREATE_CONTENT)
  async sendNotifyMail(job: Job<IQueueMailPayload>) {
    const { data } = job;

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
}
