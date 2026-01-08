# Use nginx alpine for a minimal footprint
FROM nginx:alpine

# Copy static files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY app/ /usr/share/nginx/html/app/
COPY fonts/ /usr/share/nginx/html/fonts/
COPY lib/ /usr/share/nginx/html/lib/
COPY scripts/ /usr/share/nginx/html/scripts/
COPY sounds/ /usr/share/nginx/html/sounds/
COPY styles/ /usr/share/nginx/html/styles/

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
