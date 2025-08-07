import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, FileText, Globe } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface Experience {
  position: string;
  company: string;
  duration: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
  jobTitle?: string;
  phone?: string;
  website?: string;
  currentSalary?: string;
  experience?: string;
  description?: string;
  country?: string;
  city?: string;
  address?: string;
  skills?: string[];
  experienceList?: Experience[];
  educationList?: Education[];
  interviewStatus?: 'pending' | 'approved' | 'rejected';
  applicationId?: string; // To track which application this profile is associated with
  
  // Application form data
  fullName?: string;
  currentLocation?: string;
  education?: string;
  currentCompany?: string;
  currentPosition?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  portfolio?: string;
  linkedinProfile?: string;
  coverLetter?: string;
  resume?: string;
}

interface ApiResponse {
  success: boolean;
  user: UserProfile;
  message?: string;
}

const ViewProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const applicationId = searchParams.get('applicationId') || undefined;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [application, setApplication] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  console.log('ViewProfile mounted with userId:', userId);
  
  // Format date to readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };
  
  // Format skills array to string
  const formatSkills = (skills?: string[]) => {
    if (!skills || skills.length === 0) return 'No skills listed';
    return skills.join(', ');
  };

  const handleInterviewAction = async (status: 'approved' | 'rejected') => {
    // Use applicationId from URL params first, then fall back to profile.applicationId
    const appId = applicationId || profile?.applicationId;
    
    if (!appId) {
      console.error('No application ID found in URL or profile:', { 
        applicationIdFromUrl: applicationId,
        applicationIdFromProfile: profile?.applicationId 
      });
      
      toast({
        title: 'Error',
        description: 'No application ID found. Please try again from the applications list.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      console.log('Updating application status:', { applicationId: appId, status });
      
      const response = await fetch(`${API_BASE_URL}/applications/${appId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${status === 'approved' ? 'approve' : 'reject'} application`);
      }

      // Update the local profile state with the new status
      setProfile(prev => prev ? { 
        ...prev, 
        interviewStatus: status,
        applicationId: appId // Ensure applicationId is set
      } : null);
      
      const actionText = status === 'approved' ? 'approved for interview' : 'rejected';
      toast({
        title: 'Success',
        description: `Candidate has been ${actionText}`,
      });
      
    } catch (error: any) {
      console.error('Error updating interview status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update application status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        let appId = applicationId;
        // If no applicationId, fetch the latest application for this user
        if (!appId && userId) {
          const token = localStorage.getItem('token');
          const headers: HeadersInit = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const response = await fetch(`${API_BASE_URL}/applications?userId=${userId}&sort=desc&limit=1`, { headers });
          const data = await response.json();
          if (data.success && data.applications && data.applications.length > 0) {
            appId = data.applications[0]._id;
          }
        }
        if (appId) {
          // Fetch application data
          const token = localStorage.getItem('token');
          const headers: HeadersInit = { 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const response = await fetch(`${API_BASE_URL}/applications/${appId}`, { headers });
          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Failed to load application');
          setApplication(data.application);
        } else {
          // Fallback to user profile logic
          if (!userId) {
            setError('No user ID provided');
            setLoading(false);
            return;
          }

          console.log('Fetching profile for user ID:', userId, 'with applicationId:', applicationId);
          setError(null);
          setLoading(true);
          
          // Build the URL with applicationId as a query parameter if it exists
          const url = new URL(`${API_BASE_URL}/auth/profile/${userId}`);
          if (applicationId) {
            url.searchParams.append('applicationId', applicationId);
          }
          
          const token = localStorage.getItem('token');
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          // Add authorization header if token exists
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          
          const response = await fetch(url.toString(), { headers });
          
          console.log('Response status:', response.status);
          
          const data: ApiResponse = await response.json();
          console.log('Profile API response:', data);
          
          if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
          }

          if (!data.user) {
            throw new Error('No user data received');
          }

          // Ensure applicationId is set in the profile and provide default values for arrays
          const profileData: UserProfile = {
            ...data.user,
            applicationId: applicationId || data.user.applicationId,
            skills: data.user.skills || [],
            experienceList: data.user.experienceList || [],
            educationList: data.user.educationList || []
          };
          
          setProfile(profileData);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, applicationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Error Loading Profile</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // If application data is present, show application-based profile
  if (application) {
    const app = application;
    const applicant = app.applicant || {};
    return (
      <div className="container mx-auto p-4 md:p-6 max-w-4xl">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Card className="mb-6">
          <CardHeader className="pb-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  {applicant.avatar ? (
                    <AvatarImage src={applicant.avatar} alt={applicant.firstName + ' ' + applicant.lastName} />
                  ) : (
                    <AvatarFallback>{(applicant.firstName?.[0] || '') + (applicant.lastName?.[0] || '')}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">{app.fullName || (applicant.firstName + ' ' + applicant.lastName)}</h1>
                  {app.email && (
                    <p className="text-lg text-muted-foreground">{app.email}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 md:mt-0 space-x-2">
                <Button variant="outline" asChild>
                  <a href={`mailto:${app.email}`} className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" /> Email
                  </a>
                </Button>
                {app.phone && (
                  <Button variant="outline" asChild className="bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 border-green-200">
                    <a 
                      href={`https://wa.me/${app.phone.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.498 14.382v3.3c0 .6.2 1.1.9 1.1.2 0 .5-.1.7-.2 1.9-1 5.9-3.4 5.9-10.1 0-4.5-3.8-8.3-8.3-8.3h-.1c-4.5 0-8.3 3.8-8.3 8.3 0 1.5.4 2.9 1.1 4.2.1.2.1.5.1.7l-1.6 5.2 5.3-1.6c.2 0 .5.1.7.1 1.3.7 2.8 1.1 4.2 1.1h.1c4.4 0 8.3-3.8 8.3-8.3 0-1.2-.3-2.4-.8-3.5-.1-.2-.5-.2-.7-.1l-3.4 1.1z"/>
                        <path fill="#fff" d="M16.198 18.082c-1.2.4-2.1.6-3.1.6h-.1c-1.1 0-2.8-.5-4.8-1.8l-.3-.2-3.1.9.8-3.1v-.3c-1.2-2.2-.9-4.1 0-5.5.1-.2.5-.5.8-.8.1-.1.2-.2.2-.3.1-.1 0-.2-.1-.3l-.5-.6c-.1-.1-.2-.2-.3-.2 0 0-.1 0-.1.1-.4.2-.9.6-1.1.9-.3.4-.5.8-.6 1.3 0 .1 0 .2 0 .3v.4c.1.8.4 1.7 1.2 2.7.8 1 1.6 1.6 2.5 2 1.1.5 2 .7 2.7.7h.1c.3 0 .5 0 .7-.1.2 0 .4-.1.5-.2.1-.1.3-.2.4-.4.1-.1.2-.2.1-.3 0-.1-.1-.2-.2-.3l-.9-.4c-.1-.1-.2-.1-.3 0l-1.1.5c-.1 0-.2 0-.3-.1-.1-.1-.2-.2-.1-.3l.4-1.1c0-.1.1-.2.1-.3 0-.1.1-.1.1-.2s0-.2.1-.2c0-.1 0-.2 0-.3v-.1c0-.1 0-.2-.1-.3-.1-.1-.1-.2-.2-.2l-3.9-1.8c-.1 0-.2-.1-.3 0-.1 0-.2.1-.2.2-.1.1-.1.2-.1.3v.3c0 .3.1.6.2.9.1.3.2.6.4.8.1.2.3.3.4.5.1.1.2.2.2.3.1.1 0 .3-.1.4-.1.2-.4.4-.6.6-.2.2-.4.3-.5.4-.1.1-.3.2-.4.3-.1.1-.2.2-.3.2-.1 0-.2-.1-.4-.2-.1-.1-.3-.2-.4-.4-.1-.2-.3-.3-.4-.5-.1-.2-.3-.4-.4-.6-.1-.2-.3-.5-.4-.7-.1-.2-.2-.5-.3-.8 0-.3-.1-.5-.1-.8 0-.5.1-1 .3-1.5.2-.5.5-1 .9-1.4.4-.5.9-.9 1.4-1.2.6-.3 1.2-.5 1.9-.5h.1c.3 0 .5 0 .8.1.2 0 .5.1.7.2.1 0 .1.1.1.2 0 0 0 .1-.1.1-.2.1-.4.2-.5.4-.2.2-.3.4-.4.6 0 .1 0 .2 0 .3 0 .1.1.1.2.2l.8.4c.1.1.2.1.3 0 .1 0 .1-.1.2-.2l.5-1.2c0-.1.1-.1.2-.1.1 0 .2 0 .3.1.1.1.2.2.3.3.1.1.2.3.3.4.1.1.2.2.3.4.1.2.2.3.3.5.1.2.2.3.4.5.1.1.3.3.4.4.1.1.2.3.4.4.1.1.3.2.4.4.1.1.2.2.3.2.1.1.2.1.3.2.1 0 .1 0 .2-.1.1 0 .1-.1.1-.2 0-.1 0-.2.1-.3v-.1c0-.1 0-.1.1-.2 0-.1.1-.1.1-.2 0-.1.1-.1.2-.1.2 0 .4.1.6.1.2 0 .4 0 .6-.1.2 0 .4-.1.6-.2.1 0 .1-.1.2-.1.1 0 .1-.1.1-.2 0-.1 0-.1-.1-.2l-.3-.2c-.1-.1-.2-.1-.3-.1z"/>
                      </svg>
                      WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Personal Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-primary" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a href={`mailto:${app.email}`} className="hover:underline font-medium">{app.email}</a>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{app.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-3 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Current Location</p>
                      <p className="font-medium">{app.currentLocation}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {app.portfolio && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Portfolio</p>
                        <a href={app.portfolio.startsWith('http') ? app.portfolio : `https://${app.portfolio}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 font-medium">{app.portfolio}</a>
                      </div>
                    </div>
                  )}
                  {app.linkedinProfile && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">LinkedIn</p>
                        <a href={app.linkedinProfile.startsWith('http') ? app.linkedinProfile : `https://${app.linkedinProfile}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600 font-medium">{app.linkedinProfile}</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Professional Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-primary" /> Professional Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {app.currentCompany && (
                    <div>
                      <p className="text-sm text-muted-foreground">Current Company</p>
                      <p className="font-medium">{app.currentCompany}</p>
                    </div>
                  )}
                  {app.currentPosition && (
                    <div>
                      <p className="text-sm text-muted-foreground">Current Position</p>
                      <p className="font-medium">{app.currentPosition}</p>
                    </div>
                  )}
                  {app.experience && (
                    <div>
                      <p className="text-sm text-muted-foreground">Years of Experience</p>
                      <p className="font-medium">{app.experience}</p>
                    </div>
                  )}
                  {app.education && (
                    <div>
                      <p className="text-sm text-muted-foreground">Highest Education</p>
                      <p className="font-medium">{app.education}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {app.expectedSalary && (
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Salary</p>
                      <p className="font-medium">{app.expectedSalary}</p>
                    </div>
                  )}
                  {app.noticePeriod && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notice Period</p>
                      <p className="font-medium">{app.noticePeriod}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Cover Letter */}
            {app.coverLetter && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary" /> Cover Letter
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-muted-foreground whitespace-pre-line">{app.coverLetter}</p>
                </div>
              </div>
            )}
            {/* Resume */}
            {app.resume && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary" /> Resume
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-muted-foreground">Resume uploaded: {app.resume}</p>
                  <Button variant="outline" className="mt-2" asChild>
                    <a href={`${API_BASE_URL}/${app.resume}`} target="_blank" rel="noopener noreferrer">
                      View Resume
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">The requested profile could not be found.</p>
        </div>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <Card className="mb-6">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                {profile.avatar ? (
                  <AvatarImage src={profile.avatar} alt={`${profile.firstName} ${profile.lastName}`} />
                ) : (
                  <AvatarFallback>{getInitials(profile.firstName, profile.lastName)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h1>
                {profile.jobTitle && (
                  <p className="text-lg text-muted-foreground">{profile.jobTitle}</p>
                )}
                {(profile.city || profile.country) && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {[profile.city, profile.country].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 md:mt-0 space-x-2">
              <Button variant="outline" asChild>
                <a href={`mailto:${profile.email}`} className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" /> Email
                </a>
              </Button>
              {profile.phone && (
                <Button variant="outline" asChild className="bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800 border-green-200">
                  <a 
                    href={`https://wa.me/${profile.phone.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.498 14.382v3.3c0 .6.2 1.1.9 1.1.2 0 .5-.1.7-.2 1.9-1 5.9-3.4 5.9-10.1 0-4.5-3.8-8.3-8.3-8.3h-.1c-4.5 0-8.3 3.8-8.3 8.3 0 1.5.4 2.9 1.1 4.2.1.2.1.5.1.7l-1.6 5.2 5.3-1.6c.2 0 .5.1.7.1 1.3.7 2.8 1.1 4.2 1.1h.1c4.4 0 8.3-3.8 8.3-8.3 0-1.2-.3-2.4-.8-3.5-.1-.2-.5-.2-.7-.1l-3.4 1.1z"/>
                      <path fill="#fff" d="M16.198 18.082c-1.2.4-2.1.6-3.1.6h-.1c-1.1 0-2.8-.5-4.8-1.8l-.3-.2-3.1.9.8-3.1v-.3c-1.2-2.2-.9-4.1 0-5.5.1-.2.5-.5.8-.8.1-.1.2-.2.2-.3.1-.1 0-.2-.1-.3l-.5-.6c-.1-.1-.2-.2-.3-.2 0 0-.1 0-.1.1-.4.2-.9.6-1.1.9-.3.4-.5.8-.6 1.3 0 .1 0 .2 0 .3v.4c.1.8.4 1.7 1.2 2.7.8 1 1.6 1.6 2.5 2 1.1.5 2 .7 2.7.7h.1c.3 0 .5 0 .7-.1.2 0 .4-.1.5-.2.1-.1.3-.2.4-.4.1-.1.2-.2.1-.3 0-.1-.1-.2-.2-.3l-.9-.4c-.1-.1-.2-.1-.3 0l-1.1.5c-.1 0-.2 0-.3-.1-.1-.1-.2-.2-.1-.3l.4-1.1c0-.1.1-.2.1-.3 0-.1.1-.1.1-.2s0-.2.1-.2c0-.1 0-.2 0-.3v-.1c0-.1 0-.2-.1-.3-.1-.1-.1-.2-.2-.2l-3.9-1.8c-.1 0-.2-.1-.3 0-.1 0-.2.1-.2.2-.1.1-.1.2-.1.3v.3c0 .3.1.6.2.9.1.3.2.6.4.8.1.2.3.3.4.5.1.1.2.2.2.3.1.1 0 .3-.1.4-.1.2-.4.4-.6.6-.2.2-.4.3-.5.4-.1.1-.3.2-.4.3-.1.1-.2.2-.3.2-.1 0-.2-.1-.4-.2-.1-.1-.3-.2-.4-.4-.1-.2-.3-.3-.4-.5-.1-.2-.3-.4-.4-.6-.1-.2-.3-.5-.4-.7-.1-.2-.2-.5-.3-.8 0-.3-.1-.5-.1-.8 0-.5.1-1 .3-1.5.2-.5.5-1 .9-1.4.4-.5.9-.9 1.4-1.2.6-.3 1.2-.5 1.9-.5h.1c.3 0 .5 0 .8.1.2 0 .5.1.7.2.1 0 .1.1.1.2 0 0 0 .1-.1.1-.2.1-.4.2-.5.4-.2.2-.3.4-.4.6 0 .1 0 .2 0 .3 0 .1.1.1.2.2l.8.4c.1.1.2.1.3 0 .1 0 .1-.1.2-.2l.5-1.2c0-.1.1-.1.2-.1.1 0 .2 0 .3.1.1.1.2.2.3.3.1.1.2.3.3.4.1.1.2.2.3.4.1.2.2.3.3.5.1.2.2.3.4.5.1.1.3.3.4.4.1.1.2.3.4.4.1.1.3.2.4.4.1.1.2.2.3.2.1.1.2.1.3.2.1 0 .1 0 .2-.1.1 0 .1-.1.1-.2 0-.1 0-.2.1-.3v-.1c0-.1 0-.1.1-.2 0-.1.1-.1.1-.2 0-.1.1-.1.2-.1.2 0 .4.1.6.1.2 0 .4 0 .6-.1.2 0 .4-.1.6-.2.1 0 .1-.1.2-.1.1 0 .1-.1.1-.2 0-.1 0-.1-.1-.2l-.3-.2c-.1-.1-.2-.1-.3-.1z"/>
                    </svg>
                    WhatsApp
                  </a>
                </Button>
              )}
              {profile.phone && (
                <Button variant="outline" asChild>
                  <a href={`tel:${profile.phone}`} className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" /> Call
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-primary" /> Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a href={`mailto:${profile.email}`} className="hover:underline font-medium">
                      {profile.email}
                    </a>
                  </div>
                </div>
                {profile.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  </div>
                )}
                {profile.currentLocation && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-3 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Current Location</p>
                      <p className="font-medium">{profile.currentLocation}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {profile.portfolio && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-3 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Portfolio</p>
                      <a href={profile.portfolio.startsWith('http') ? profile.portfolio : `https://${profile.portfolio}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="hover:underline text-blue-600 font-medium">
                        {profile.portfolio}
                      </a>
                    </div>
                  </div>
                )}
                {profile.linkedinProfile && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-3 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">LinkedIn</p>
                      <a href={profile.linkedinProfile.startsWith('http') ? profile.linkedinProfile : `https://${profile.linkedinProfile}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="hover:underline text-blue-600 font-medium">
                        {profile.linkedinProfile}
                      </a>
                    </div>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-3 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="hover:underline text-blue-600 font-medium">
                        {profile.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-primary" /> Professional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {profile.currentCompany && (
                  <div>
                    <p className="text-sm text-muted-foreground">Current Company</p>
                    <p className="font-medium">{profile.currentCompany}</p>
                  </div>
                )}
                {profile.currentPosition && (
                  <div>
                    <p className="text-sm text-muted-foreground">Current Position</p>
                    <p className="font-medium">{profile.currentPosition}</p>
                  </div>
                )}
                {profile.experience && (
                  <div>
                    <p className="text-sm text-muted-foreground">Years of Experience</p>
                    <p className="font-medium">{profile.experience}</p>
                  </div>
                )}
                {profile.education && (
                  <div>
                    <p className="text-sm text-muted-foreground">Highest Education</p>
                    <p className="font-medium">{profile.education}</p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {profile.expectedSalary && (
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Salary</p>
                    <p className="font-medium">{profile.expectedSalary}</p>
                  </div>
                )}
                {profile.noticePeriod && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notice Period</p>
                    <p className="font-medium">{profile.noticePeriod}</p>
                  </div>
                )}
                {profile.currentSalary && (
                  <div>
                    <p className="text-sm text-muted-foreground">Current Salary</p>
                    <p className="font-medium">{profile.currentSalary}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Cover Letter */}
          {profile.coverLetter && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" /> Cover Letter
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-muted-foreground whitespace-pre-line">{profile.coverLetter}</p>
              </div>
            </div>
          )}

          {/* Resume */}
          {profile.resume && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" /> Resume
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-muted-foreground">Resume uploaded: {profile.resume}</p>
                <Button variant="outline" className="mt-2" asChild>
                  <a href={`${API_BASE_URL}/${profile.resume}`} target="_blank" rel="noopener noreferrer">
                    View Resume
                  </a>
                </Button>
              </div>
            </div>
          )}

          {profile.description && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-muted-foreground whitespace-pre-line">{profile.description}</p>
            </div>
          )}

          {profile.experienceList && profile.experienceList.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-primary" /> Experience
              </h2>
              <div className="space-y-4">
                {profile.experienceList.map((exp, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4 py-1">
                    <h3 className="font-medium">{exp.position}</h3>
                    <p className="text-muted-foreground">{exp.company}</p>
                    <p className="text-sm text-muted-foreground">
                      {exp.duration}
                    </p>
                    {exp.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.educationList && profile.educationList.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-primary" /> Education
              </h2>
              <div className="space-y-4">
                {profile.educationList.map((edu, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4 py-1">
                    <h3 className="font-medium">{edu.degree}</h3>
                    <p className="text-muted-foreground">{edu.institution}</p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {edu.year}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interview Action Buttons - Only show for recruiters */}
      {profile?.role !== 'recruiter' && (
        <div className="mt-6 flex justify-end space-x-4">
          <Button 
            variant="outline" 
            className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
            disabled={updatingStatus}
            onClick={() => handleInterviewAction('rejected')}
          >
            {updatingStatus ? 'Updating...' : 'Reject'}
          </Button>
          <Button 
            variant="default"
            disabled={updatingStatus}
            onClick={() => handleInterviewAction('approved')}
          >
            {updatingStatus ? 'Updating...' : 'Approve for Interview'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ViewProfile;
