import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import { Repository } from 'typeorm';

import { BadRequestException } from '../common/exceptions/bad-request';
import { ConfigService } from '../config/config.service';

import { EmailVerificationEntity } from './email-verification.entity';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailVerificationEntity)
    private readonly emailVerificationRepository: Repository<
      EmailVerificationEntity
    >,

    private readonly configService: ConfigService,
  ) {}

  find(where: any): Promise<EmailVerificationEntity[]> {
    return this.emailVerificationRepository.find(where);
  }

  findOne(where: any): Promise<EmailVerificationEntity> {
    return this.emailVerificationRepository.findOne(where);
  }

  delete(where: any): Promise<any> {
    return this.emailVerificationRepository.softDelete(where);
  }

  save(
    data: Partial<EmailVerificationEntity>,
  ): Promise<EmailVerificationEntity | undefined> {
    let entity = data;
    if (!(entity instanceof EmailVerificationEntity)) {
      entity = EmailVerificationEntity.create(data);
    }

    return this.emailVerificationRepository.save(entity);
  }

  updateRaw({ where, data }: { where: any; data: any }): Promise<any> {
    return this.emailVerificationRepository.update(where, data);
  }

  create(
    data: Partial<EmailVerificationEntity>,
  ): Promise<EmailVerificationEntity | undefined> {
    let entity = data;
    if (!(entity instanceof EmailVerificationEntity)) {
      entity = EmailVerificationEntity.create(data);
    }

    return this.save(entity);
  }

  async sendEmailVerification(email: string): Promise<boolean> {
    const emailCode = await this.emailVerificationRepository.findOne({ email });

    if (emailCode && emailCode.emailToken) {
      const transporter = nodemailer.createTransport({
        ...this.configService.getEmailConfig,
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: 'Movie-base',
        to: email, // list of receivers (separated by ,)
        subject: 'Movie-base - Registration confirmation',
        message: 'Verify Email',
        html:
          'Hello! <br><br> You have registered your account with hmd.care<br><br>' +
          'In order to activate your account, please click' +
          '<a href=' +
          this.configService +
          '/api/auth/email/verify/' +
          emailCode.emailToken +
          '>here</a>', // html body
      };

      const sent = await new Promise<boolean>(async (resolve, reject) => {
        return await transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            console.log('Message sent: %s', error);
            return reject(false);
          }
          console.log('Message sent: %s', info.messageId);
          resolve(true);
        });
      });

      return sent;
    } else {
      throw new BadRequestException();
    }
  }
}
