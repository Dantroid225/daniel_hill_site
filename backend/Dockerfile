FROM node:20-alpine

WORKDIR /app

# Install curl, CA certificates, OpenSSL, and MySQL client
RUN apk add --no-cache curl ca-certificates openssl mysql-client

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy backend source code only
COPY backend/src/ ./src/
COPY backend/scripts/ ./scripts/
COPY backend/.env ./
COPY backend/eslint.config.js ./
COPY backend/jest.config.js ./

# Copy EC2's certificate store into the container
COPY certs/ /etc/ssl/certs/
RUN echo "EC2 certificates copied to container" && \
    ls -la /etc/ssl/certs/ | head -10

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"] 