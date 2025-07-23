# DH Portfolio Backend

This is the backend API for the DH Portfolio website, built with Node.js, Express, and MySQL.

## Features

- **RESTful API** for portfolio management
- **User Authentication** with JWT tokens
- **Contact Form** handling
- **File Upload** support
- **Database Integration** with MySQL
- **Security** with Helmet and CORS
- **Error Handling** with standardized responses

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── schema.sql
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── contactController.js
│   │   └── portfolioController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── PortfolioItem.js
│   ├── routes/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── contact.js
│   │   └── portfolio.js
│   ├── utils/
│   │   ├── errorHandler.js
│   │   └── responseHelper.js
│   └── server.js
├── uploads/
│   ├── images/
│   └── documents/
├── logs/
├── tests/
├── package.json
├── env.example
└── README.md
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure your settings:
```bash
cp env.example .env
```

Update the `.env` file with your database credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=dh_portfolio
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=24h

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Database Setup
1. Ensure MySQL is running on your system
2. Create the database and tables using the schema:
```bash
mysql -u root -p < src/config/schema.sql
```

### 4. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/refresh-token` - Refresh JWT token

### Portfolio
- `GET /api/portfolio` - Get all portfolio items
- `GET /api/portfolio/:id` - Get portfolio item by ID
- `POST /api/portfolio` - Create new portfolio item
- `PUT /api/portfolio/:id` - Update portfolio item
- `DELETE /api/portfolio/:id` - Delete portfolio item

### Contact
- `POST /api/contact/submit` - Submit contact form
- `GET /api/contact/inquiries` - Get all inquiries
- `GET /api/contact/inquiries/:id` - Get inquiry by ID
- `PUT /api/contact/inquiries/:id/status` - Update inquiry status

### Health Check
- `GET /health` - Server health check

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `password` - Hashed password
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Portfolio Items Table
- `id` - Primary key
- `title` - Project title
- `description` - Project description
- `image_url` - Project image URL
- `project_url` - Project live URL
- `technologies` - JSON array of technologies used
- `category` - Project category
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Contact Inquiries Table
- `id` - Primary key
- `name` - Contact person's name
- `email` - Contact email
- `subject` - Inquiry subject
- `message` - Inquiry message
- `status` - Inquiry status (new, read, replied, closed)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Security Features

- **JWT Authentication** for protected routes
- **Password Hashing** with bcrypt
- **CORS Protection** for cross-origin requests
- **Helmet** for security headers
- **Input Validation** with express-validator
- **Rate Limiting** to prevent abuse

## Development

### Available Scripts
- `npm start` - Start the server
- `npm run dev` - Start in development mode with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## Deployment

1. Set `NODE_ENV=production` in your environment
2. Configure production database credentials
3. Set up proper JWT secret
4. Configure CORS origins for production
5. Set up reverse proxy (nginx) if needed
6. Use PM2 or similar process manager

## Error Handling

The API uses standardized error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

Successful responses:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Write tests for new features
5. Update documentation

## License

This project is part of the DH Portfolio website migration. 