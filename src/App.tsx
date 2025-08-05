import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import { JobsProvider } from "@/contexts/JobsContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import MyProfile from "./pages/MyProfile";
import Resume from "./pages/Resume";
import AppliedJobs from "./pages/AppliedJobs";
import ViewProfile from "./pages/ViewProfile";
import JobAlerts from "./pages/JobAlerts";
import ShortlistedJobs from "./pages/ShortlistedJobs";
import CVManager from "./pages/CVManager";
import Packages from "./pages/Packages";
import ChangePassword from "./pages/ChangePassword";
import JobDetails from "@/pages/JobDetails";
import Jobs from "@/pages/Jobs";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import DashboardLayout from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};

// Main App Component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <JobsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Public Routes - No authentication required */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="*" element={<NotFound />} />
                
                {/* Protected Routes for Regular Users */}
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
                  
                  <Route path="/resume" element={
                    <div className="py-6">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                        <Resume />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/applied-jobs" element={
                    <div className="py-6">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                        <AppliedJobs />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/profile/:userId" element={
                    <div className="py-6">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                        <ViewProfile />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/job-alerts" element={
                    <div className="py-6">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                        <JobAlerts />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/shortlisted-jobs" element={
                    <div className="py-6">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                        <ShortlistedJobs />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/cv-manager" element={
                    <div className="py-6">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                        <CVManager />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/packages" element={
                    <div className="py-6">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                        <Packages />
                      </div>
                    </div>
                  } />
                  
                  <Route path="/change-password" element={
                    <div className="py-6">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                        <ChangePassword />
                      </div>
                    </div>
                  } />
                </Route>
                
                {/* Protected Route for Recruiters - No DashboardLayout */}
                <Route path="/recruiter-dashboard" element={
                  <ProtectedRoute>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </JobsProvider>
    </QueryClientProvider>
  );
};

export default App;
