#!/bin/bash
cd /home/ubuntu/etc
cp -i ./development.env ./project/src
mv -i ./project/{.,}* ../kryber
