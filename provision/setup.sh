#!/bin/bash

echo " === INIT provisioning of virtual machine ==="
apt-get update -y > /dev/null
apt-get install python-software-properties build-essential -y > /dev/null

echo " > Installing Git..."
apt-get install git -y > /dev/null

echo " > Installing NGINX..."
apt-get install nginx -y > /dev/null

echo " > Updating PHP repository..."
add-apt-repository ppa:ondrej/php5-5.6 -y > /dev/null
apt-get update > /dev/null

echo " > Installing PHP..."
apt-get install php5-common php5-dev php5-cli php5-mcrypt php5-fpm -y > /dev/null
php5enmod php5-mcrypt
yes | cp -rf /vagrant/provision/config/php.ini /etc/php5/fpm/php.ini
service php5-fpm restart

echo " > Installing PHP extensions..."
apt-get install curl php5-curl php5-gd php5-mcrypt php5-mysql -y > /dev/null

echo " > Installing and setting debconf utils for MySQL..."
apt-get install debconf-utils -y > /dev/null
debconf-set-selections <<< "mysql-server mysql-server/root_password password f0rc3pt"
debconf-set-selections <<< "mysql-server mysql-server/root_password_again password f0rc3pt"
apt-get install mysql-server -y > /dev/null

echo " > Configuring NGINX hosts..."
cp /vagrant/provision/config/nginx_vhost /etc/nginx/sites-available/nginx_vhost > /dev/null
ln -s /etc/nginx/sites-available/nginx_vhost /etc/nginx/sites-enabled/
rm -rf /etc/nginx/sites-available/default
service nginx restart > /dev/null

echo " > Updating + installing dependencies through Composer..."
cd /vagrant
php composer.phar update
php composer.phar install

echo " > Running database migrations and seeding..."
mysql -u root -pf0rc3pt -e "create database forcept";
php artisan migrate --force --seed

# echo " > Installing Node..."
# apt-get install nodejs npm -y > /dev/null
# npm install --global gulp -y
# cd /vagrant/src
# npm install -y
# gulp watch
