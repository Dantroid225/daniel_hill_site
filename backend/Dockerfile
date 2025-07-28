FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install dependencies (will work with or without package-lock.json)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source code
COPY . .

# Download AWS RDS CA certificate (2019 root)
RUN curl -o rds-ca-2019-root.pem https://s3.amazonaws.com/rds-downloads/rds-ca-2019-root.pem

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"] 