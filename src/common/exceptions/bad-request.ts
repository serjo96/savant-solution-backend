import { BadRequestException as Exception } from '@nestjs/common';

export class BadRequestException extends Exception {
  constructor(message?: any, error?: string) {
    let msg: Record<string, unknown> | string | undefined;

    if (message && message instanceof Object) {
      msg = {
        statusCode: 400,
        error: 'Bad Request',
        message: [message],
      };
    } else if (message && typeof message === 'string') {
      msg = message;
    }

    super(msg, error);
  }
}
