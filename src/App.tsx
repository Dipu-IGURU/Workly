import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import MyProfile from "./pages/MyProfile";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      // If no token or user data, redirect to login immediately
      if (!token || !user) {
        console.log('No token or user found, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoading(false);
        navigate('/login', { 
          replace: true, 
          state: { 
            from: location.pathname !== '/login' ? location.pathname : '/',
            message: 'Please log in to access this page.'
          } 
        });
        return;
      }

      try {
        // Verify token with the server
        const response = await fetch('http://localhost:5001/api/auth/verify-token', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error('Token verification failed');
        }
        
        const data = await response.json();
        
        // If we get here, token is valid
        setIsAuthenticated(true);
        setIsLoading(false);
        
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoading(false);
        navigate('/login', { 
          replace: true, 
          state: { 
            from: location.pathname !== '/login' ? location.pathname : '/',
            message: 'Your session has expired. Please log in again.'
          } 
        });
      }
    };

    checkAuth();
  }, [navigate, location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
};

// Main App Component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Dashboard Routes */}
            <Route element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Outlet />
                </DashboardLayout>
              </ProtectedRoute>
            }>
              <Route path="/user-dashboard" element={
                <div className="py-6">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    <UserDashboard />
                  </div>
                </div>
              } />
              
              <Route path="/profile" element={
                <div className="py-6">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    <MyProfile />
                  </div>
                </div>
              } />
              
              <Route path="/recruiter-dashboard" element={
                <div className="py-6">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    <RecruiterDashboard />
                  </div>
                </div>
              } />
            </Route>
            
            {/* 404 Route - Must be last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
