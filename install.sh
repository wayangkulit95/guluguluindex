#!/bin/bash

# Update and upgrade the system
echo "Updating and upgrading the system..."
sudo apt update -y
sudo apt upgrade -y

# Install Node.js and npm if not already installed
echo "Installing Node.js and npm..."
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install required dependencies
echo "Installing required npm dependencies..."
npm install express googleapis path

# Create necessary directories for the app
echo "Setting up project directories..."
mkdir -p /var/www/myapp

# Download app.js from GitHub
echo "Downloading app.js from GitHub..."
curl -L https://github.com/wayangkulit95/guluguluindex/raw/main/app.js -o /var/www/myapp/app.js

# Optional: Create a basic public directory for static files
echo "Setting up public directory for static files..."
mkdir -p /var/www/myapp/public

# Give necessary permissions to the project directory
echo "Setting proper permissions..."
sudo chown -R $USER:$USER /var/www/myapp

# Navigate to the project directory
cd /var/www/myapp

# Start the application using Node.js
echo "Starting the application..."
nohup node app.js > app.log 2>&1 &

# Confirm the setup is complete
echo "Application setup is complete. You can access the app at http://localhost:3000"

