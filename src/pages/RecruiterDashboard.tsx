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
  description: string;
  requirements: string;
  createdAt: string;
  applicants: number;
  postedBy: string;
}

interface Application {
  _id: string;
  jobId: string;
  jobTitle: string;
  applicantId: string;
  applicantName: string;
  email: string;
  resume: string;
  coverLetter: string;
  status: 'pending' | 'reviewed' | 'interview' | 'rejected' | 'hired';
  appliedAt: string;
  skills: string[];
  experience: string;
}

const RecruiterDashboard = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }
      
      console.log('Token found, making API request to fetch jobs');

      // Add a timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      try {
        // First, verify the token is still valid
        const verifyResponse = await fetch('http://localhost:5001/api/auth/verify-token', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        if (!verifyResponse.ok) {
          throw new Error('Session expired. Please log in again.');
        }

        // If token is valid, fetch jobs
        const response = await fetch('http://localhost:5001/api/jobs', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Check if response is OK (status 200-299)
        if (!response.ok) {
          if (response.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('token');
            navigate('/login');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setJobs(data.data || []);
        } else {
          throw new Error(data.message || 'Failed to fetch jobs');
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          console.error('Network error:', error);
          throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
        }
        
        // Handle timeout errors
        if (error.name === 'AbortError') {
          console.error('Request timed out:', error);
          throw new Error('Request timed out. The server is taking too long to respond. Please try again later.');
        }
        
        // Handle other errors
        console.error('Error in fetchJobs:', error);
        throw error;
      }


    } catch (error: any) {
      console.error('Error in fetchJobs:', error);
      
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to fetch jobs. Please try again.';
      
      // If it's an authentication error, redirect to login
      if (error.message?.includes('Session expired') || error.message?.includes('unauthorized')) {
        localStorage.removeItem('token');
        navigate('/login');
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
      } else {
        // Show other errors to the user
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setApplicationsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5001/api/applications/recruiter', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      if (data.success) {
        setApplications(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchApplications();
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
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="jobs">Job Posts</TabsTrigger>
                <TabsTrigger value="candidates">Candidates</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Job Posts</CardTitle>
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{jobs.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {jobs.filter(job => new Date(job.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} this month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Applications Received</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{applications.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {applications.filter(app => new Date(app.appliedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} this week
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Interviews Scheduled</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {applications.filter(app => app.status === 'interview').length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {applications.filter(app => 
                          app.status === 'interview' && 
                          new Date(app.appliedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        ).length} this week
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
                                <h4 className="font-semibold">{application.applicantName}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {application.jobTitle}
                                </p>
                                <p className="text-xs text-muted-foreground">{timeText}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={
                                    application.status === 'pending' ? 'default' : 
                                    application.status === 'reviewed' ? 'secondary' : 
                                    application.status === 'interview' ? 'outline' :
                                    application.status === 'hired' ? 'default' : 'destructive'
                                  }
                                >
                                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </Badge>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    // Navigate to application details or open a modal
                                    // This can be implemented based on your navigation setup
                                    console.log('View application:', application._id);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
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
                      ) : (
                        <JobList 
                          jobs={jobs} 
                          onDelete={handleJobDeleted}
                        />
                      )}
                    </CardContent>
                  </Card>
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
                      <Card key={application._id} className="overflow-hidden
                        hover:shadow-md transition-shadow duration-200">
                        <CardContent className="p-0">
                          <div className="md:flex">
                            <div className="p-6 flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-semibold">{application.applicantName}</h3>
                                    <Badge 
                                       variant={
                                        application.status === 'pending' ? 'outline' :
                                        application.status === 'reviewed' ? 'secondary' :
                                        application.status === 'interview' ? 'default' :
                                        application.status === 'hired' ? 'secondary' : 'destructive'
                                      }
                                      className="capitalize"
                                    >
                                      {application.status}
                                    </Badge>
                                  </div>
                                  <p className="text-muted-foreground">{application.jobTitle}</p>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {application.skills?.slice(0, 3).map((skill, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {application.skills?.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{application.skills.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-2">
                                    Applied on {new Date(application.appliedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" asChild>
                                    <a 
                                      href={application.resume} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1"
                                    >
                                      <FileText className="h-4 w-4" />
                                      <span className="hidden sm:inline">Resume</span>
                                    </a>
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="sm" className="h-9">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Actions</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onSelect={() => updateApplicationStatus(application._id, 'reviewed')}>
                                        <CheckCircle2 className="mr-2 h-4 w-4 text-blue-500" />
                                        Mark as Reviewed
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onSelect={() => updateApplicationStatus(application._id, 'interview')}>
                                        <CalendarIcon className="mr-2 h-4 w-4 text-amber-500" />
                                        Schedule Interview
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onSelect={() => updateApplicationStatus(application._id, 'hired')}>
                                        <ThumbsUp className="mr-2 h-4 w-4 text-green-500" />
                                        Mark as Hired
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onSelect={() => updateApplicationStatus(application._id, 'rejected')}
                                      >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject Application
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                              
                              {application.coverLetter && (
                                <div className="mt-4 text-sm text-muted-foreground">
                                  <p className="font-medium">Cover Letter:</p>
                                  <p className="line-clamp-2">{application.coverLetter}</p>
                                </div>
                              )}
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
