#!/bin/bash
cd /home/ubuntu/etc
cp -i ./production.env ../krayber
cd /home/ubuntu/krayber

pm2 startOrReload ecosystem.config.js
