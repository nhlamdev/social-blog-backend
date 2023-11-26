import { QUEUE_MAIL } from '@/constants/queue';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Processor(QUEUE_MAIL)
export class MailConsumer {
  private readonly emailAccount = process.env.EMAIL_ACCOUNT;
  private readonly emailPassword = process.env.EMAIL_PASSWORD;
  private readonly nodemailer: typeof nodemailer = require('nodemailer');
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

  @Process('send-notify-mail')
  async sendMail(job: Job<any>) {
    console.log(job.data);

    this.transporter.sendMail({
      from: this.emailAccount,
      to: 'dev.nhlam@gmail.com',
      subject: 'Sending Email using Node.js[nodemailer]',
      text: 'That was easy!',
    });
  }
}
