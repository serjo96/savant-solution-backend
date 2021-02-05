#!/bin/bash
cd /home/ubuntu/etc
yes | cp ./production.env ../krayber
cd /home/ubuntu/krayber
echo START PROD
pm2 startOrReload ecosystem.config.js --only kryber-backend
