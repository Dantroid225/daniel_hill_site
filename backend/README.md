# DH Portfolio Backend

A Node.js/Express backend for the DH Portfolio website with admin management capabilities.

## Features

- **Portfolio Management**: CRUD operations for portfolio projects
- **Image Upload**: Support for project images with automatic optimization
- **Image Archiving**: When projects are deleted or images are updated, old images are moved to an archived folder instead of being deleted
- **Admin Authentication**: Secure admin login and session management
- **Contact Management**: Handle contact form submissions
- **Database**: MySQL database with proper schema

## Image Archiving

When a project is deleted or its image is updated, the system automatically archives the old image file instead of deleting it permanently. This provides a safety net and allows for potential recovery.

### Archive Location

- Archived images are stored in: `uploads/archived/`
- Files are renamed with timestamp prefix: `archived-YYYY-MM-DDTHH-MM-SS-sssZ-originalname.ext`

### Archive Management

- Admin can view archived images via: `GET /api/admin/archived-images`
- Archived images are served statically at: `/uploads/archived/`

## API Endpoints

### Portfolio Management

- `GET /api/portfolio` - Get all published portfolio items
- `GET /api/portfolio/:id` - Get specific portfolio item
- `POST /api/admin/portfolio` - Create new portfolio item (admin)
- `PUT /api/admin/portfolio/:id` - Update portfolio item (admin)
- `DELETE /api/admin/portfolio/:id` - Delete portfolio item (admin)
- `PUT /api/admin/portfolio/:id/featured` - Toggle featured status (admin)
- `PUT /api/admin/portfolio/:id/status` - Update status (admin)
- `GET /api/admin/archived-images` - Get archived images (admin)

### Admin Authentication

- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/profile` - Get admin profile

### Contact Management

- `POST /api/contact` - Submit contact form
- `GET /api/admin/contact` - Get contact submissions (admin)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:

   ```
   # Database
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=dh_portfolio
   DB_PORT=3306

   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=24h

   # Server
   PORT=5000
   NODE_ENV=development

   # CORS (Development)
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1:3000
   ```

   See `ENV_SETUP.md` for detailed configuration options.

3. Set up the database:

   ```bash
   npm run setup
   ```

4. Start the server:
   ```bash
   npm start
   ```

## File Structure

```
src/
├── config/
│   ├── database.js
│   └── schema.sql
├── controllers/
│   ├── adminAuthController.js
│   ├── authController.js
│   ├── contactController.js
│   └── portfolioController.js
├── middleware/
│   ├── adminAuth.js
│   ├── auth.js
│   └── upload.js
├── routes/
│   ├── admin.js
│   ├── api.js
│   ├── auth.js
│   ├── contact.js
│   └── portfolio.js
├── utils/
│   ├── errorHandler.js
│   └── responseHelper.js
└── server.js

uploads/
├── images/          # Active project images
└── archived/        # Archived images
```

## Image Upload

Images are automatically processed and optimized using Sharp:

- Resized to max 1200x800 pixels
- Converted to JPEG format
- Quality set to 85%
- Progressive JPEG enabled

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- File upload validation
- CORS protection
- Helmet security headers
- Rate limiting
- Input validation

## Error Handling

All API responses follow a consistent format:

```json
{
  "success": true/false,
  "message": "Response message",
  "data": {...} // Optional data payload
}
```
