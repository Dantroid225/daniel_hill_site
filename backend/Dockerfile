FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (will work with or without package-lock.json)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source code
COPY . .

# Download AWS RDS CA certificate
RUN curl -o rds-ca-2019-root.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"] 