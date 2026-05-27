# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_OPENAI_API_KEY

# Pass them to the build process
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
