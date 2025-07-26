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
  XCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  status: 'draft' | 'active' | 'closed';
  createdAt: string;
  updatedAt?: string;
  description?: string;
  requirements?: string[];
  skills?: string[];
  experience?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
  };
  applicants?: number;
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

        const response = await fetch('http://localhost:5001/api/auth/profile', {
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
      const response = await fetch('http://localhost:5001/api/jobs/my-jobs', {
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
          const refreshResponse = await fetch('http://localhost:5001/api/auth/refresh-token', {
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
      
      if (data && data.success) {
        const validJobs = Array.isArray(data.jobs) ? data.jobs : [];
        console.log(`Loaded ${validJobs.length} jobs`);
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
        description: 'Failed to load job postings. Please refresh the page.',
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
        const response = await fetch('http://localhost:5001/api/applications/recruiter/applications', {
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
            const refreshResponse = await fetch('http://localhost:5001/api/auth/refresh-token', {
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
          const validApplications = Array.isArray(data.applications) 
            ? data.applications.filter(app => app && app._id && app.applicant)
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
      
      // Show a user-friendly error message
      toast({
        title: 'Error',
        description: 'Failed to load applications. Please try again.',
        variant: 'destructive',
      });
      
      // If it's an authentication error, redirect to login
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    console.log('RecruiterDashboard mounted, user:', user);
    if (user) {
      console.log('User is authenticated, fetching data...');
      fetchJobs();
      fetchApplications();
    } else {
      console.log('No user found, checking localStorage...');
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      console.log('Stored user:', storedUser);
      console.log('Stored token exists:', !!storedToken);
      
      if (storedToken) {
        console.log('Attempting to fetch user profile with stored token...');
        // Try to fetch user profile with stored token
        fetch('http://localhost:5001/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
        })
          .then(response => {
            console.log('Profile response status:', response.status);
            if (!response.ok) throw new Error('Failed to fetch profile');
            return response.json();
          })
          .then(data => {
            console.log('Profile data:', data);
            if (data.success && data.user) {
              setUser(data.user);
              localStorage.setItem('user', JSON.stringify(data.user));
            } else {
              console.error('Invalid profile response:', data);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/login');
            }
          })
          .catch(error => {
            console.error('Error fetching profile:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          });
      } else {
        console.log('No stored token, redirecting to login');
        navigate('/login');
      }
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

      const response = await fetch(`http://localhost:5001/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
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
      const response = await fetch(`http://localhost:5001/api/jobs/${jobId}/applicants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.applicants)) {
        setSelectedJobApplicants(data.applicants);
      } else {
        setSelectedJobApplicants([]);
      }
    } catch (err) {
      setSelectedJobApplicants([]);
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
  const totalApplications = applicationStats.total || 0;
  const pendingReview = applicationStats.pending || 0;
  const underReview = applicationStats.reviewed || 0;
  const interviewScheduled = applicationStats.interview || 0;
  const rejected = applicationStats.rejected || 0;
  const hired = applicationStats.hired || 0;
  
  // Calculate job post stats
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
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">W</span>
              </div>
              <span className="ml-2 text-xl font-bold">Workly</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user.firstName}! ({user.company})
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
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
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-10 h-10 text-primary-foreground" />
                </div>
                <CardTitle>{user.firstName} {user.lastName}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <Badge variant="secondary" className="mt-2">Recruiter</Badge>
                <p className="text-sm text-muted-foreground mt-1">{user.company}</p>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Job Posts
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Candidates
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Applications
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Interviews
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Overview
                  {applicationStats.interview > 0 && (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                      {applicationStats.interview}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="jobs">Job Posts</TabsTrigger>
                <TabsTrigger value="candidates">Candidates</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Job Posts</CardTitle>
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{activeJobs}</div>
                      <p className="text-xs text-muted-foreground">
                        {draftJobs} in draft, {closedJobs} closed
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalApplications}</div>
                      <p className="text-xs text-muted-foreground">
                        {pendingReview} pending review
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Interviews</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{interviewScheduled}</div>
                      <p className="text-xs text-muted-foreground">
                        {interviewsThisWeek} scheduled this week
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Hired</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{hired}</div>
                      <p className="text-xs text-muted-foreground">
                        {rejected} not selected
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>Latest candidate applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
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
                            <div key={application._id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h4 className="font-semibold">{application.applicant?.firstName} {application.applicant?.lastName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {application.jobTitle}
                                </p>
                                <p className="text-xs text-muted-foreground">{timeText}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(`/profile/${application.applicant?._id}?applicationId=${application._id}`, '_blank')}
                                >
                                  View Profile
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      {applications.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
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
                      <h2 className="text-2xl font-bold">Job Posts</h2>
                      <p className="text-muted-foreground">Manage your job postings</p>
                    </div>
                    <JobPostForm onSuccess={handleJobPosted}>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Post New Job
                      </Button>
                    </JobPostForm>
                  </div>
                  <Card>
                    <CardContent className="p-6">
                      {jobsLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : jobs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium">No job posts yet</h3>
                          <p className="text-sm">Start by posting your first job to attract candidates.</p>
                        </div>
                      ) : (
                        <div className="grid gap-4">
                          {jobs.map((job) => (
                            <Card key={job._id} className="border-2 hover:shadow-lg transition-shadow">
                              <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                  <div className="flex-1">
                                    <h3 className="font-bold text-xl text-primary">{job.title}</h3>
                                    <p className="text-muted-foreground text-sm mt-1">
                                      <span className="font-medium">{job.company}</span> &middot; {job.location} &middot; 
                                      <Badge variant="secondary" className="ml-2">{job.type}</Badge>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      Posted on {new Date(job.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                      {job.description}
                                    </p>
                                  </div>
                                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                                    <div className="text-center">
                                      <Badge variant="outline" className="text-xs bg-primary/10">
                                        {job.applicants && job.applicants.length > 0 
                                          ? `${job.applicants.length} Applicant${job.applicants.length > 1 ? 's' : ''}` 
                                          : 'No Applicants'}
                                      </Badge>
                                    </div>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleViewApplicants(job._id, job.title)}
                                      className="min-w-[120px]"
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
                        <h2 className="text-xl font-bold mb-4">Applicants for {selectedJobTitle}</h2>
                        {applicantsLoading ? (
                          <div className="text-center py-8">Loading...</div>
                        ) : selectedJobApplicants.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">No applicants yet.</div>
                        ) : (
                          <div className="space-y-4 max-h-96 overflow-y-auto">
                            {selectedJobApplicants.map((app, idx) => (
                              <div key={app.user._id || idx} className="border rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                <div>
                                  <div className="font-semibold">{app.user.firstName} {app.user.lastName}</div>
                                  <div className="text-xs text-muted-foreground">{app.user.email}</div>
                                </div>
                                {/* Add more profile info as needed */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/profile/${app.user._id}`)}
                                >
                                  View Profile
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="candidates">
                <Card>
                  <CardHeader>
                    <CardTitle>Candidate Database</CardTitle>
                    <CardDescription>Search and manage candidates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                      Candidate management will be implemented here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Applications</h2>
                  <p className="text-muted-foreground">Review and manage job applications</p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search applications..."
                      className="pl-8 w-full"
                      // Add search functionality here
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Select>
                      <SelectTrigger className="w-[180px]">
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
                      <SelectTrigger className="w-[180px]">
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
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : applications.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No applications yet</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Applications for your job postings will appear here.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <Card key={application._id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-0">
                          <div className="md:flex">
                            <div className="p-6 flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold">{application.applicant?.firstName} {application.applicant?.lastName}</h3>
                                  </div>
                                  <p className="text-muted-foreground">{application.jobTitle}</p>
                                  <div className="text-xs text-muted-foreground">{application.applicant?.email}</div>
                                  <p className="text-sm text-muted-foreground mt-2">
                                    Applied on {new Date(application.appliedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                variant="outline" 
                                size="sm" 
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
