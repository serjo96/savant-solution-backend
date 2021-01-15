#!/bin/bash
cd /home/ubuntu/krayber
mv -i ../etc/develop.env ./dist
pm2 start ecosystem.config.js
