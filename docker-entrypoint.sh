#!/bin/sh

yarn migration:run
pm2 start ecosystem.config.js
