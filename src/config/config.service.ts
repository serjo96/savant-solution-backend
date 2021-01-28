import * as Joi from '@hapi/joi';
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { existsSync, readFileSync } from 'fs';

export interface IEnvConfig {
  [key: string]: string | number;
}

export interface IEmailConfig {
  host: string;
  secure: string;
  auth: {
    user: string;
    pass: string;
  };
}

export interface IJWTConfig {
  secretCode: string;
  expiresIn: string;
}

export interface IElasticConfig {
  node: string;
  auth: {
    username: string;
    password: string;
  };
}

@Injectable()
export class ConfigService {
  private readonly envConfig: IEnvConfig;

  constructor(filePath: string) {
    let config = {};

    const envFileExists = existsSync(filePath);
    if (envFileExists) {
      config = dotenv.parse(readFileSync(filePath));
    }

    config = { ...config, ...process.env };
    this.envConfig = this.validateInput(config);
  }

  private validateInput(envConfig: IEnvConfig): IEnvConfig {
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

  get AIURL(): string {
    return this.envConfig.AI_URL as string;
  }

  get dbURL(): string {
    return this.envConfig.DATABASE_URL as string;
  }

  get nodeEnv(): string {
    return this.envConfig.NODE_ENV as string;
  }

  get elasticConfig(): IElasticConfig {
    return {
      node: this.envConfig.ELASTICSEARCH_NODE as string,
      auth: {
        username: this.envConfig.ELASTICSEARCH_USERNAME as string,
        password: this.envConfig.ELASTICSEARCH_PASSWORD as string,
      },
    };
  }

  get jwtConfig(): IJWTConfig {
    return {
      secretCode: this.envConfig.JWT_SECRET_KEY as string,
      expiresIn: this.envConfig.EXPIRESIN as string,
    };
  }

  get getEmailConfig(): IEmailConfig {
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
