#####################
## PREPARE BUILDER ##
#####################
FROM node:12 as builder

ENV NPM_CONFIG_LOGLEVEL warn

COPY package.json yarn.lock /tmp/

RUN cd /tmp && yarn
RUN mkdir -p /opt/app && cp -a /tmp/node_modules /opt/app/

WORKDIR /opt/app
COPY migrations migrations/
COPY src src/
COPY types types/
COPY package.json tsconfig.json ormconfig.cli.js tsconfig.build.json ./
COPY ormconfig.prod.js ./ormconfig.js

RUN yarn build
RUN rm -rf src/

####################
## PREPARE RUNNER ##
####################
FROM node:12 as runner

RUN mkdir -p /opt/app
WORKDIR /opt/app

COPY --from=builder /opt/app .
COPY docker-entrypoint.sh .
CMD ["sh", "/docker-entrypoint.sh"]
CMD [ "npm", "run", "start:prod" ]
#ENTRYPOINT ["sh", "/docker-entrypoint.sh"]
