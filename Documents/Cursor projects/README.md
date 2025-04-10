# Goodly Heritage School Entrance Exam System

A web-based entrance examination system for Goodly Heritage Comprehensive High School. The system allows administrators to manage questions and view results, while students can register, take exams, and view their results.

## Features

### Admin Features
- Question management (add, edit, delete)
- Bulk upload questions
- View student results
- Generate detailed reports

### Student Features
- Registration with unique exam number
- Take entrance examination
- View exam results
- Review answers and corrections

## Technology Stack

### Backend
- Node.js with Express
- TypeScript
- MongoDB for database
- JWT for authentication

### Frontend
- React with TypeScript
- Material-UI for components
- React Router for navigation
- Axios for API calls

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn package manager

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd entrance-exam-app
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory with the following content:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/entrance-exam
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
ADMIN_EMAIL=admin@goodlyheritage.edu
ADMIN_PASSWORD=admin123
```

4. Install frontend dependencies:
```bash
cd ../entrance-exam-app
npm install
```

5. Start the development servers:

For backend:
```bash
cd backend
npm run dev
```

For frontend:
```bash
cd entrance-exam-app
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Initial Login

### Admin
- Username: admin
- Password: admin123

### Student
1. Register through the registration form
2. Use the provided exam number and password to log in

## Development

### Backend Structure
- `src/models/` - Database models
- `src/routes/` - API routes
- `src/middleware/` - Custom middleware

### Frontend Structure
- `src/components/` - Reusable components
- `src/pages/` - Page components
- `src/pages/admin/` - Admin pages
- `src/pages/student/` - Student pages

## Production Deployment

1. Build the frontend:
```bash
cd entrance-exam-app
npm run build
```

2. Build the backend:
```bash
cd backend
npm run build
```

3. Set up environment variables for production
4. Deploy the built files to your hosting provider

## Security Considerations

1. Change the JWT secret in production
2. Use HTTPS in production
3. Implement rate limiting
4. Sanitize user inputs
5. Regular security updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 