# Workly - Modern Job Portal

Workly is a full-stack job portal application built with React, TypeScript, and Node.js. It provides a platform for job seekers and recruiters to connect and manage job applications.

## 🚀 Features

- **User Authentication** - Secure login and registration system
- **Recruiter Dashboard** - Manage job postings and view applications
- **Job Search** - Browse and search for job opportunities
- **Profile Management** - Create and update user profiles
- **Responsive Design** - Works on desktop and mobile devices

## 🛠 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite - Next Generation Frontend Tooling
- Tailwind CSS with Shadcn/ui components
- React Query for data fetching
- React Hook Form with Zod validation
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT Authentication
- Express Validator for request validation
- Multer for file uploads

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/workly.git
   cd workly
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

3. **Environment Setup**
   - Create a `.env` file in the root directory with the following variables:
     ```
     PORT=3001
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     ```
   - Create a `.env` file in the `server` directory with the same variables

### Running the Application

1. **Start the development server**
   ```bash
   # Start frontend
   npm run dev
   
   # In a new terminal, start the backend
   cd server
   npm run dev
   ```

2. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📦 Build

To create a production build:

```bash
# Build frontend
npm run build

# The frontend will be available in the 'dist' directory
```

## 🧪 Testing

To run tests:
```bash
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Vite](https://vitejs.dev/) for the amazing development experience
- [React](https://reactjs.org/) for making frontend development fun
