#!/bin/bash

echo "================================="
echo " Build React Router"
echo "================================="

bun run build

echo "================================="
echo " Upload Build"
echo "================================="

scp -r build root@192.168.4.9:/var/www/html/react-router-v7/

echo "================================="
echo " Restart PM2"
echo "================================="

ssh root@192.168.4.9 << EOF

cd /var/www/html/react-router-v7

pm2 restart react-router-v7

EOF

echo "================================="
echo " Deploy Success"
echo "================================="