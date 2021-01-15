#!/bin/bash
cd /home/ubuntu/krayber
mv -i ../etc/develop.env ./
pm2 start ecosystem.config.js
