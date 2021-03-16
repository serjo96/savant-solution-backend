## Description

Project based on nest.js framework + elastic-search + kibana and docker.

## System requirements


* node.js 10.14.0 >=
* Docker

**elastic-search dev**
* docker limit <= 2 gb memory

**elastic-search prod**
* docker limit 3 - 4.5 gb memory




## Installation

```bash
$ npm install
```

## Running the app for development

```bash
# development nest.js
$ npm run start

# elastic-search + kibana
$ docker-compose -f docker-compose-dev.yml up -d
```
Выключить "последствия эластика":
`wsl --shutdown
`

## Production manual start

```bash
#node
$ pm2 startOrRestart ecosystem.config.js --only kryber-backend

#elastic-search
$ docker-compose -f docker-compose-prod.yml up -d
```
