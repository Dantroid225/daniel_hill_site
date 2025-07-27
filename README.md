# Daniel Hill Portfolio Website

A modern, full-stack portfolio website built with React, TypeScript, and Node.js. Features a responsive design with dark/light theme support, admin management capabilities, and a comprehensive project showcase.

## 🚀 Features

### Frontend

- **Modern React/TypeScript** - Built with React 18, TypeScript, and Vite
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Theme System** - Dark/light mode with smooth transitions
- **Animations** - Framer Motion animations and scroll-triggered effects
- **Admin Dashboard** - Protected admin area for content management
- **Contact Form** - Functional contact form with validation
- **Project Showcase** - Dynamic portfolio with image management

### Backend

- **Node.js/Express** - RESTful API with comprehensive endpoints
- **MySQL Database** - Relational database with proper schema
- **Image Management** - Automatic image optimization and archiving
- **Admin Authentication** - JWT-based secure admin login
- **File Upload** - Multer with Sharp image processing
- **Security** - Helmet, CORS, rate limiting, and input validation

## 🛠️ Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication
- **Multer** - File upload handling
- **Sharp** - Image processing
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
daniel_hill_site/
├── frontend/                 # React/TypeScript frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layer
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # Node.js/Express backend
│   ├── src/
│   │   ├── config/          # Database and app configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utility functions
│   ├── uploads/             # File upload directory
│   └── package.json
└── docs/                    # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- MySQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd daniel_hill_site
   ```

2. **Install dependencies**

   ```bash
   # Install all dependencies (frontend + backend)
   npm run install:all
   ```

## 🚀 Deployment

### AWS Deployment

This project includes comprehensive AWS deployment configuration using Terraform, Docker, and GitHub Actions.

#### Quick Start

1. **Prerequisites**

   - AWS Account with appropriate permissions
   - Domain name with Route53 hosted zone
   - Terraform installed locally
   - Docker installed locally

2. **Deploy Infrastructure**

   ```bash
   cd infrastructure/terraform
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   terraform init
   terraform plan
   terraform apply
   ```

3. **Configure GitHub Secrets**
   Add the required secrets to your GitHub repository for CI/CD.

4. **Deploy Application**
   Push to the `main` branch to trigger automatic deployment.

#### Detailed Guide

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for a comprehensive deployment guide.

#### Infrastructure Components

- **VPC** - Custom networking with public/private subnets
- **EC2** - Auto-scaling application servers
- **RDS** - MySQL database with automated backups
- **S3** - Static asset storage
- **CloudFront** - Global content delivery network
- **Route53** - DNS management
- **ACM** - SSL certificate management

#### Cost Estimation

Monthly costs (us-east-1): ~$25.50

- EC2 t3.micro: ~$8.50
- RDS db.t3.micro: ~$15.00
- CloudFront: ~$1.00
- S3: ~$0.50
- Route53: ~$0.50

### Local Development

# Install backend dependencies

cd ../backend
npm install

````

3. **Set up environment variables**

Create `.env` file in the backend directory:

```env
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
````

4. **Set up the database**

   ```bash
   cd backend
   npm run setup
   ```

5. **Start the development servers**

   **Option 1: Run separately**

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

   **Option 2: Run concurrently**

   ```bash
   cd frontend
   npm run dev:full
   ```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Admin Dashboard**: http://localhost:5173/admin

## 📚 Available Scripts

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run dev:full     # Start both frontend and backend
```

### Backend

```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
npm run setup        # Set up database and admin user
npm run test         # Run tests
npm run lint         # Run ESLint
```

## 🔧 Configuration

### Frontend Configuration

- **Vite**: Configured for React with TypeScript
- **Tailwind CSS**: Custom design system with CSS variables
- **Theme**: Dark/light mode with localStorage persistence
- **Routing**: React Router with protected admin routes

### Backend Configuration

- **Database**: MySQL with connection pooling
- **Security**: Helmet, CORS, rate limiting
- **File Upload**: Multer with Sharp image optimization
- **Authentication**: JWT with bcrypt password hashing

## 🎨 Design System

The project uses a comprehensive design system with:

- **CSS Variables** for consistent theming
- **Tailwind CSS** for utility-first styling
- **Dark/Light Mode** with smooth transitions
- **Responsive Design** with mobile-first approach
- **Animation System** with Framer Motion
- **Component Library** with reusable UI components

### Color Palette

- **Primary**: #3B82F6 (Blue)
- **Secondary**: #8B5CF6 (Purple)
- **Accent**: #10B981 (Green)

## 🔐 Admin Features

- **Secure Login** with JWT authentication
- **Portfolio Management** - CRUD operations for projects
- **Image Upload** with automatic optimization
- **Contact Management** - View and manage contact submissions
- **Image Archiving** - Automatic archiving of old images

## 📱 Pages

- **Home** - Hero section with animated background
- **About** - Personal information and skills
- **Projects** - Portfolio showcase with filtering
- **Contact** - Contact form with validation

- **Admin** - Protected admin dashboard

## 🚀 Deployment

### Frontend Deployment

```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment

```bash
cd backend
npm start
# Use PM2 or similar process manager for production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions, please contact [your-email@example.com]

---

**Built with ❤️ using React, TypeScript, and Node.js**
