import * as Joi from '@hapi/joi';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { existsSync, readFileSync } from 'fs';

export interface EnvConfig {
  [key: string]: string | number;
}

export interface EmailConfig {
  host: string;
  secure: string;
  auth: {
    user: string;
    pass: string;
  };
}

export interface JWTConfig {
  secretCode: string;
  expiresIn: string;
}

@Injectable()
export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(filePath: string) {
    let config = {};

    const envFileExists = existsSync(filePath);
    if (envFileExists) {
      config = dotenv.parse(readFileSync(filePath));
    }

    config = { ...config, ...process.env };
    this.envConfig = this.validateInput(config);
  }

  private validateInput(envConfig: EnvConfig): EnvConfig {
    const configSchema: Joi.ObjectSchema = Joi.object({
      DATABASE_URL: Joi.string().required(),
      NODE_ENV: Joi.string()
        .valid('development', 'production', 'test', 'provision')
        .default('development'),
    });

    const { error, value: validatedEnvConfig } = configSchema.validate(
      envConfig,
      {
        allowUnknown: true,
      },
    );

    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }

    return validatedEnvConfig;
  }

  get dbURL(): string {
    return this.envConfig.DATABASE_URL as string;
  }

  get nodeEnv(): string {
    return this.envConfig.NODE_ENV as string;
  }

  get jwtConfig(): JWTConfig {
    return {
      secretCode: this.envConfig.JWT_SECRET_KEY as string,
      expiresIn: this.envConfig.EXPIRESIN as string,
    };
  }

  get getEmailConfig(): EmailConfig {
    return {
      host: this.envConfig.EMAIL_HOST as string,
      secure: this.envConfig.EMAIL_SECURE as string, // true for 465, false for other ports
      auth: {
        user: this.envConfig.EMAIL_USER as string,
        pass: this.envConfig.EMAIL_PASSWORD as string,
      },
    };
  }
}
