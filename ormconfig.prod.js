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
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/**/*.js'],
  subscribers: ['dist/subscribers/**/.js'],
  cli: {
    entitiesDir: 'src',
    migrationsDir: 'migrations',
    subscribersDir: 'subscribers',
  },
  seeds: ['seeds/**/*.seed.ts'],
  factories: ['factories/**/*.factory.ts'],
};
