#!/bin/bash
cd /home/ubuntu/etc
yes | cp -i ./production.env ../krayber
cd /home/ubuntu/krayber
echo START PROD
pm2 startOrRestart ecosystem.config.js
