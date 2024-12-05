FROM nginx:latest

# Copy your website files to the Nginx HTML directory
COPY /var/www/html/smartcostmanagement /usr/share/nginx/html

# Copy SSL certificates
COPY /etc/letsencrypt/live/cloud.nxtmate.com /etc/letsencrypt/live/cloud.nxmate.com

# Expose port 80 (HTTP) and 443 (HTTPS)
EXPOSE 80 443

# Update the Nginx configuration for SSL
COPY nginx.conf /etc/nginx/nginx.conf

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
