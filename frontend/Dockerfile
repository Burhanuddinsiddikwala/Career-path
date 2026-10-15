# CareerPath AI - Frontend Dockerfile
# Multi-stage build: compiles Vite React app, then serves via optimized Nginx

# --- Stage 1: Build ---
FROM node:22-alpine AS build

WORKDIR /app

# Copy package descriptors
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --ignore-scripts

# Copy frontend source
COPY . .

# Build production bundle with optional API URL override
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# --- Stage 2: Serve ---
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
