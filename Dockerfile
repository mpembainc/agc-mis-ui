# Use the official Node.js image as the base image
FROM node:24-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Angular CLI globally
RUN npm install -g @angular/cli@21

# Install project dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the Angular application
RUN ng build --configuration production

# Use the official Nginx image to serve the application
FROM nginx:alpine

# Copy the built Angular application from the previous stage
COPY --from=0 /app/dist/agc-mis-ui/browser /usr/share/nginx/html

# Copy custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]