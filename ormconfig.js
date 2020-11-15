const dotenv = require('dotenv');
const { existsSync, readFileSync } = require('fs');

let config = {};

const configFile = `${process.env.NODE_ENV || 'development'}.env`;

const envFileExists = existsSync(configFile);
if (envFileExists) {
  config = dotenv.parse(readFileSync(configFile));
} else {
  config = {DATABASE_URL: process.env.DATABASE_URL || ''};
}
config = { ...config, ...process.env };

module.exports = {
  type: 'postgres',
  url: config.DATABASE_URL,
  logging: false,
  entities: ['dist/src/**/*.entity.js'],
  migrations: ['dist/migrations/**/*.js'],
  subscribers: ['dist/subscriber/**/*.js'],
  cli: {
    entitiesDir: 'src',
    migrationsDir: 'dist/migrations',
    subscribersDir: 'dist/subscribers',
  },
  seeds: ['dist/seeds/**/*.seed.ts'],
  factories: ['dist/factories/**/*.factory.ts'],
};
