import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw,
  CheckCircle,
  Clock as ClockIcon,
  DollarSign,
  MapPin,
  Search,
  X,
  FileText,
  User,
  Briefcase
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// DashboardLayout is now handled by the router
import { cn } from "@/lib/utils";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  location?: string;
  title?: string;
}

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  danger?: boolean;
}

interface JobApplication {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status?: string;
  date: string;
  salary?: string;
  logo?: string;
}

const UserDashboard: React.FC = () => {
  const [user, setUser] = useState<UserData | null>({
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'user',
    title: 'Senior UI/UX Designer',
    location: 'San Francisco, CA',
    avatar: ''
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appliedJobs, setAppliedJobs] = useState<JobApplication[]>([]);
  const [appStats, setAppStats] = useState({
    total: 0,
    changeFromLastWeek: 0
  });
  const [interviewStats, setInterviewStats] = useState({
    total: 0,
    thisWeek: 0
  });
  
  const [profileStats, setProfileStats] = useState({
    totalViews: 0,
    percentageChange: 0
  });


  useEffect(() => {
    console.log('UserDashboard mounted, checking authentication...');
    
    const checkAuthAndFetchProfile = async () => {
      try {
        // First check if we have a token
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        console.log('Token from localStorage:', token ? 'exists' : 'not found');
        
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login');
          return;
        }

        // If we have saved user data, use it for initial render
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          console.log('Using saved user data:', parsedUser);
          setUser(parsedUser);
          
          // Verify the token is still valid
          try {
            const response = await fetch('http://localhost:5001/api/auth/verify-token', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            
            if (!data.valid) {
              throw new Error('Token validation failed');
            }
            
            // Token is valid, fetch fresh user data in the background
            fetchUserProfile(token);
          } catch (error) {
            console.error('Token validation error:', error);
            handleAuthError();
          }
        } else {
          // No saved user, fetch fresh data
          await fetchUserProfile(token);
        }
      } catch (error) {
        console.error('Authentication check error:', error);
        handleAuthError();
      } finally {
        setLoading(false);
      }
    };
    
    const fetchUserProfile = async (token: string) => {
      try {
        console.log('Fetching fresh user profile...');
        const response = await fetch('http://localhost:5001/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Profile API response:', data);
        
        if (data.success && data.user) {
          console.log('Profile data received:', data.user);
          setUser(data.user);
          
          // Update localStorage with fresh user data
          localStorage.setItem('user', JSON.stringify(data.user));
          
          if (data.user.role !== 'user') {
            console.log('User role is not user, redirecting to recruiter dashboard');
            navigate('/recruiter-dashboard', { replace: true });
            return;
          }
          
          console.log('User is a regular user, showing dashboard');
        } else {
          throw new Error(data.message || 'Failed to fetch profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        handleAuthError();
      }
    };
    
    const handleAuthError = () => {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Show error toast
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      
      // Redirect to login
      navigate('/login', { replace: true });
    };

    checkAuthAndFetchProfile();
  }, [navigate, toast]);

  // Fetch application statistics
  const fetchApplicationStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('http://localhost:5001/api/profile/applied-jobs/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success && data.stats) {
        setAppStats({
          total: data.stats.total,
          changeFromLastWeek: data.stats.changeFromLastWeek
        });
      }
    } catch (error) {
      console.error('Error fetching application stats:', error);
    }
  };

  // Fetch applied jobs after authentication
  const fetchAppliedJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://localhost:5001/api/profile/applied-jobs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.jobs)) {
        setAppliedJobs(
          data.jobs.map((item: any) => ({
            id: item.job._id,
            title: item.job.title,
            company: item.job.company,
            location: item.job.location,
            type: item.job.type,
            date: item.appliedAt,
          }))
        );
      }
    } catch (err) {
      console.error('Error fetching applied jobs:', err);
    }
  };

  // Fetch interview statistics
  const fetchInterviewStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('http://localhost:5001/api/profile/interview-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success && data.stats) {
        setInterviewStats({
          total: data.stats.totalInterviews,
          thisWeek: data.stats.interviewsThisWeek
        });
      }
    } catch (error) {
      console.error('Error fetching interview stats:', error);
    }
  };

  // Fetch profile view statistics
  const fetchProfileStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // First get the current user's ID
      const userResponse = await fetch('http://localhost:5001/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const userData = await userResponse.json();
      if (!userData.success || !userData.user) return;
      
      // Now fetch the profile view stats
      const statsResponse = await fetch(`http://localhost:5001/api/profile/${userData.user._id}/view-stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const statsData = await statsResponse.json();
      if (statsData.success && statsData.stats) {
        setProfileStats({
          totalViews: statsData.stats.totalViews,
          percentageChange: statsData.stats.percentageChange
        });
      }
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAppliedJobs();
    fetchApplicationStats();
    fetchInterviewStats();
    fetchProfileStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">No user data available.</p>
        </div>
      </div>
    );
  }

  // Get current route path
  const currentPath = location.pathname;

  // Navigation is now handled by DashboardSidebar component

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              Home
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="ml-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Applications Sent</p>
                <h3 className="text-2xl font-bold mt-1">{appStats.total}</h3>
                {appStats.changeFromLastWeek !== 0 && (
                  <p className={`text-sm mt-1 ${
                    appStats.changeFromLastWeek >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {appStats.changeFromLastWeek >= 0 ? '+' : ''}{appStats.changeFromLastWeek} from last week
                  </p>
                )}
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Interviews</p>
                <h3 className="text-2xl font-bold mt-1">{interviewStats.total}</h3>
                {interviewStats.thisWeek > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    {interviewStats.thisWeek} scheduled this week
                  </p>
                )}
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Profile Views</p>
                <h3 className="text-2xl font-bold mt-1">{profileStats.totalViews}</h3>
                {profileStats.percentageChange !== 0 && (
                  <p className={`text-sm mt-1 ${
                    profileStats.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {profileStats.percentageChange >= 0 ? '+' : ''}{profileStats.percentageChange}% from last month
                  </p>
                )}
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card className="mb-8">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Track your job applications</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/applied-jobs')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {appliedJobs.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No applications yet.</div>
            ) : (
              appliedJobs.map((job) => (
                <div key={job.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.company}</p>
                        <div className="flex items-center mt-1 text-xs text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {new Date(job.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge className={cn("text-xs", getStatusBadge(job.status || 'applied'))}>
                        Applied
                      </Badge>
                      <Button variant="outline" size="sm" className="text-xs">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Jobs */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recommended Jobs</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Jobs that match your profile</p>
            </div>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
