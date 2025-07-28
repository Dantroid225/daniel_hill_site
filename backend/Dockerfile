FROM node:20-alpine

WORKDIR /app

# Install curl, CA certificates, OpenSSL, and MySQL client
RUN apk add --no-cache curl ca-certificates openssl mysql-client

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Download AWS RDS CA certificate bundle (correct URL)
RUN curl -o rds-ca-2019-root.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem && \
    ls -la rds-ca-2019-root.pem && \
    echo "Certificate downloaded successfully" && \
    head -5 rds-ca-2019-root.pem && \
    # Verify certificate integrity
    openssl crl2pkcs7 -nocrl -certfile rds-ca-2019-root.pem | openssl pkcs7 -print_certs > /dev/null 2>&1 && \
    echo "Certificate verification passed"

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"] 