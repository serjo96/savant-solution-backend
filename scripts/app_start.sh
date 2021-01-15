#!/bin/bash
cd /home/ubuntu/etc
cp -i ./development.env ../krayber
cd /home/ubuntu/krayber

pm2 start ecosystem.config.js
