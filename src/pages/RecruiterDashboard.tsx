import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Plus, 
  Eye, 
  Calendar, 
  Loader2, 
  Search, 
  MoreHorizontal, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  ThumbsUp, 
  XCircle,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/config";
import { JobPostForm } from "@/components/JobPostForm";
import { JobList } from "@/components/JobList";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { Dialog } from '@/components/ui/dialog';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  company: string;
}

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status?: 'draft' | 'active' | 'closed';
  createdAt?: string;
  date?: string;
  updatedAt?: string;
  description?: string;
  requirements?: string;
  skills?: string[];
  experience?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  applicants?: Array<{_id: string, user: string, appliedAt: string}>;
  views?: number;
  postedBy?: string;
  isRemote?: boolean;
  applicationDeadline?: string;
  isActive?: boolean;
}

interface Application {
  _id: string;
  jobId: string;
  jobTitle: string;
  applicant: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  appliedAt: string;
  status?: 'pending' | 'reviewed' | 'interview' | 'rejected' | 'hired';
}

const RecruiterDashboard = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    interview: 0,
    rejected: 0,
    hired: 0
  });
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [applicantsModalOpen, setApplicantsModalOpen] = useState(false);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState<any[]>([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>('');
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (data.success) {
          setUser(data.user);
          if (data.user.role !== 'recruiter') {
            navigate('/user-dashboard');
          }
        } else {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
  };

  const fetchJobs = async () => {
    try {
      setJobsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found in localStorage');
        navigate('/login');
        return;
      }

      console.log('Fetching recruiter jobs...');
      const response = await fetch(`${API_BASE_URL}/api/jobs/my-jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('Jobs API Response Status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
            method: 'POST',
            credentials: 'include',
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.token) {
              localStorage.setItem('token', refreshData.token);
              // Retry the request with new token
              return fetchJobs();
            }
          }
          // If refresh fails, redirect to login
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        
        const errorText = await response.text();
        console.error('Jobs API Error:', errorText);
        throw new Error(`Failed to fetch jobs: ${response.status}`);
      }

      const data = await response.json();
      console.log('Jobs API Response:', data);
      console.log('User ID from token:', user?.id);
      
      if (data && data.success) {
        const validJobs = Array.isArray(data.data) ? data.data : [];
        console.log(`Loaded ${validJobs.length} jobs:`, validJobs);
        setJobs(validJobs);
        
        // If no applications loaded yet, try to fetch them again
        if (applications.length === 0) {
          fetchApplications();
        }
      } else {
        console.error('Failed to load jobs:', data?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error in fetchJobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load jobs. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found in localStorage');
        navigate('/login');
        return;
      }

      console.log('Fetching applications...');
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/applications/recruiter/applications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        console.log('API Response Status:', response.status, response.statusText);
        
        if (!response.ok) {
          // If unauthorized, try to refresh token
          if (response.status === 401) {
            console.log('Token might be expired, attempting to refresh...');
            const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
              method: 'POST',
              credentials: 'include',
            });
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              if (refreshData.token) {
                localStorage.setItem('token', refreshData.token);
                // Retry the original request with the new token
                return fetchApplications();
              }
            }
            // If refresh fails, redirect to login
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          
          // Show user-friendly error message
          let errorMessage = 'Failed to load applications';
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error('Error parsing error response:', e);
          }
          
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
          return;
        }
        
        const data = await response.json();
        console.log('API Response Data:', data);
        
        if (data && data.success) {
          // Ensure we have valid application data
          const validApplications = Array.isArray(data.data) 
            ? data.data.filter(app => app && app._id && app.applicant)
            : [];
            
          console.log(`Loaded ${validApplications.length} valid applications`);
          
          // Set applications with the filtered list
          setApplications(validApplications);
          
          // Calculate stats based on the actual data if counts are not provided
          const stats = data.counts || {
            total: validApplications.length,
            pending: validApplications.filter(app => app.status === 'pending').length,
            reviewed: validApplications.filter(app => app.status === 'reviewed').length,
            interview: validApplications.filter(app => app.status === 'interview').length,
            rejected: validApplications.filter(app => app.status === 'rejected').length,
            hired: validApplications.filter(app => app.status === 'hired').length
          };
          
          console.log('Setting application stats:', stats);
          setApplicationStats(stats);
          return; // Success, exit the function
        } else {
          console.error('API request was not successful:', data?.message || 'No success flag in response');
          throw new Error(data?.message || 'Invalid response format from server');
        }
      } catch (error) {
        console.error('Error in fetchApplications:', error);
        throw error; // Re-throw to be caught by the outer catch
      }
      
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      let errorMessage = 'Failed to load applications. Please try again later.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'recruiter') {
      console.log('Fetching data for authenticated recruiter...');
      fetchJobs();
      fetchApplications();
    }
  }, [user]);

  // Refresh data periodically
  useEffect(() => {
    if (user && user.role === 'recruiter') {
      const interval = setInterval(() => {
        console.log('Refreshing data...');
        fetchJobs();
        fetchApplications();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  const handleJobPosted = () => {
    fetchJobs();
  };

  const handleJobDeleted = (jobId: string) => {
    setJobs(jobs.filter(job => job._id !== jobId));
  };

  const updateApplicationStatus = async (applicationId: string, status: Application['status']) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      const data = await response.json();
      if (data.success) {
        setApplications(applications.map(application => application._id === applicationId ? { ...application, status } : application));
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewApplicants = async (jobId: string, jobTitle: string) => {
    setApplicantsModalOpen(true);
    setSelectedJobTitle(jobTitle);
    setApplicantsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/applicants`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
            method: 'POST',
            credentials: 'include',
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.token) {
              localStorage.setItem('token', refreshData.token);
              // Retry the request with new token
              return handleViewApplicants(jobId, jobTitle);
            }
          }
          // If refresh fails, redirect to login
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        
        throw new Error(`Failed to fetch applicants: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.applicants)) {
        console.log(`Loaded ${data.applicants.length} applicants for job: ${jobTitle}`);
        setSelectedJobApplicants(data.applicants);
      } else {
        console.log('No applicants found or invalid response format');
        setSelectedJobApplicants([]);
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setSelectedJobApplicants([]);
      toast({
        title: "Error",
        description: "Failed to load applicants. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplicantsLoading(false);
    }
  };

  // Calculate dynamic stats
  const activeJobPosts = jobs.length;
  const jobsThisMonth = jobs.filter(job => new Date(job.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
  const applicationsReceived = applications.length;
  const applicationsThisWeek = applications.filter(app => new Date(app.appliedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  const interviewsScheduled = applications.filter(app => app.status === 'interview').length;
  const interviewsThisWeek = applications.filter(app => app.status === 'interview' && new Date(app.appliedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

  // Calculate statistics
  const totalApplications = applications.length;
  const pendingReview = applications.filter(app => app.status === 'pending').length;
  const underReview = applicationStats.reviewed || 0;
  const interviewScheduled = applicationStats.interview || 0;
  const rejected = applicationStats.rejected || 0;
  const hired = applicationStats.hired || 0;
  
  // Calculate job post stats
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'active').length;
  const draftJobs = jobs.filter(job => job.status === 'draft').length;
  const closedJobs = jobs.filter(job => job.status === 'closed').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-800">Workly</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.firstName}! ({user.company})
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  fetchJobs();
                  fetchApplications();
                  toast({
                    title: "Refreshed",
                    description: "Data has been refreshed successfully.",
                  });
                }}
                className="flex items-center gap-2"
                disabled={jobsLoading || applicationsLoading}
              >
                <Loader2 className={`w-4 h-4 ${(jobsLoading || applicationsLoading) ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">{user.firstName} {user.lastName}</CardTitle>
                <Badge variant="secondary" className="mt-2 bg-gray-100 text-gray-700">Recruiter</Badge>
                <p className="text-sm text-gray-500 mt-1">{user.company}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <nav className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">
                    <Briefcase className="w-4 h-4 mr-3" />
                    Job Posts
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">
                    <Users className="w-4 h-4 mr-3" />
                    Candidates
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">
                    <FileText className="w-4 h-4 mr-3" />
                    Applications
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">
                    <Calendar className="w-4 h-4 mr-3" />
                    Interviews
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
                <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">1</div>
                  Overview
                </TabsTrigger>
                <TabsTrigger value="jobs" className="text-gray-600">Job Posts</TabsTrigger>
                <TabsTrigger value="candidates" className="text-gray-600">Candidates</TabsTrigger>
                <TabsTrigger value="applications" className="text-gray-600">Applications</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-700">Job Posts</CardTitle>
                      <Briefcase className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-800">{totalJobs}</div>
                      <p className="text-xs text-gray-500">
                        {draftJobs} in draft, {closedJobs} closed
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-700">Total Applications</CardTitle>
                      <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-800">{totalApplications}</div>
                      <p className="text-xs text-gray-500">
                        {pendingReview} pending review
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-700">Interviews</CardTitle>
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-800">{interviewScheduled}</div>
                      <p className="text-xs text-gray-500">
                        {interviewsThisWeek} scheduled this week
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-700">Hired</CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-800">{hired}</div>
                      <p className="text-xs text-gray-500">
                        {rejected} not selected
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-800">Recent Applications</CardTitle>
                    <CardDescription className="text-gray-500">Latest candidate applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {applications
                        .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
                        .slice(0, 3)
                        .map((application) => {
                          const appliedDate = new Date(application.appliedAt);
                          const timeDiff = Date.now() - appliedDate.getTime();
                          const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
                          const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                          
                          let timeText = '';
                          if (hoursAgo < 24) {
                            timeText = `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
                          } else {
                            timeText = `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
                          }

                          return (
                            <div key={application._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                              <div>
                                <h4 className="font-semibold text-gray-800">{application.applicant?.firstName} {application.applicant?.lastName}</h4>
                                <p className="text-sm text-gray-600">
                                  {application.jobTitle}
                                </p>
                                <p className="text-xs text-gray-500">{timeText}</p>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                                onClick={() => window.open(`/profile/${application.applicant?._id}?applicationId=${application._id}`, '_blank')}
                              >
                                View Profile
                              </Button>
                            </div>
                          );
                        })}
                      {applications.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No applications found
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="jobs">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Job Posts</h2>
                      <p className="text-gray-600">Manage your job postings</p>
                    </div>
                    <JobPostForm onSuccess={handleJobPosted}>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Post New Job
                      </Button>
                    </JobPostForm>
                  </div>
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6">
                      {jobsLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                      ) : jobs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-800">No job posts yet</h3>
                          <p className="text-sm text-gray-600">Start by posting your first job to attract candidates.</p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {jobs.map((job) => (
                            <Card key={job._id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                  <div className="flex-1">
                                    <h3 className="font-bold text-xl text-blue-600">{job.title}</h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                      <span className="font-medium">{job.company}</span> &middot; {job.location} &middot; 
                                      <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">{job.type}</Badge>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                      Posted on {new Date(job.date || job.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                      {job.description}
                                    </p>
                                  </div>
                                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                                    <div className="text-center">
                                       <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                         {job.applicants && Array.isArray(job.applicants) && job.applicants.length > 0 
                                           ? `${job.applicants.length} Applicant${job.applicants.length > 1 ? 's' : ''}` 
                                           : 'No Applicants'}
                                      </Badge>
                                    </div>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleViewApplicants(job._id, job.title)}
                                      className="min-w-[120px] bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Applicants
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  {/* Applicants Modal */}
                  {applicantsModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                        <button
                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                          onClick={() => setApplicantsModalOpen(false)}
                        >
                          ×
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Applicants for {selectedJobTitle}</h2>
                        <p className="text-sm text-gray-600 mb-6">Total applicants: {selectedJobApplicants.length}</p>
                        {applicantsLoading ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-gray-600">Loading applicants...</p>
                          </div>
                        ) : selectedJobApplicants.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-lg font-medium text-gray-800 mb-2">No applicants yet</p>
                            <p className="text-sm text-gray-600">When candidates apply to this job, they will appear here.</p>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {selectedJobApplicants.map((app, idx) => {
                              const appliedDate = new Date(app.appliedAt);
                              const timeDiff = Date.now() - appliedDate.getTime();
                              const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
                              const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                              
                              let timeText = '';
                              if (hoursAgo < 24) {
                                timeText = `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
                              } else {
                                timeText = `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
                              }

                              return (
                                <div key={app.user._id || idx} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                          <span className="text-blue-600 font-semibold text-sm">
                                            {app.user.firstName?.[0]}{app.user.lastName?.[0]}
                                          </span>
                                        </div>
                                        <div>
                                          <div className="font-semibold text-gray-800">
                                            {app.user.firstName} {app.user.lastName}
                                          </div>
                                          <div className="text-sm text-gray-600">{app.user.email}</div>
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Applied {timeText} • {appliedDate.toLocaleDateString()}
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                                        onClick={() => navigate(`/profile/${app.user._id}`)}
                                      >
                                        View Profile
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="candidates">
                <Card className="border-0 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-800">Candidate Database</CardTitle>
                    <CardDescription className="text-gray-600">Search and manage candidates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-gray-500 py-8">
                      Candidate management will be implemented here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Applications</h2>
                  <p className="text-gray-600">Review and manage job applications</p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search applications..."
                      className="pl-8 w-full border-gray-200"
                      // Add search functionality here
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Select>
                      <SelectTrigger className="w-[180px] border-gray-200">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-[180px] border-gray-200">
                        <SelectValue placeholder="Sort by date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest first</SelectItem>
                        <SelectItem value="oldest">Oldest first</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {applicationsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : applications.length === 0 ? (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="py-12 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-800">No applications yet</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Applications for your job postings will appear here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <Card key={application._id} className="overflow-hidden hover:shadow-md transition-shadow duration-200 border border-gray-200">
                        <CardContent className="p-0">
                          <div className="md:flex">
                            <div className="p-6 flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold text-gray-800">{application.applicant?.firstName} {application.applicant?.lastName}</h3>
                                  </div>
                                  <p className="text-gray-600">{application.jobTitle}</p>
                                  <div className="text-xs text-gray-500">{application.applicant?.email}</div>
                                  <p className="text-sm text-gray-500 mt-2">
                                    Applied on {new Date(application.appliedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                variant="outline" 
                                size="sm" 
                                className="bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                                onClick={() => navigate(`/profile/${application.applicant?._id}`)}
                              >
                                View Profile
                              </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
