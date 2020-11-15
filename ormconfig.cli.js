const dotenv = require('dotenv');
const { existsSync, readFileSync } = require('fs');

let config = {};

const configFile = `${process.env.NODE_ENV || 'development'}.env`;

const envFileExists = existsSync(configFile);
if (envFileExists) {
  config = dotenv.parse(readFileSync(configFile));
}
config = { ...config, ...process.env };

module.exports = {
  type: 'postgres',
  url: config.DATABASE_URL,
  logging: true,
  entities: ['src/**/*.entity.ts'],
  migrations: ['migrations/**/*.ts'],
  subscribers: ['subscriber/**/*.ts'],
  cli: {
    entitiesDir: 'src',
    migrationsDir: 'migrations',
    subscribersDir: 'subscribers',
  },
  seeds: ['seeds/**/*.seed.ts'],
  factories: ['factories/**/*.factory.ts'],
};
