import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, FileText, Globe } from 'lucide-react';

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
      
      const response = await fetch(`http://localhost:5001/api/applications/${appId}/status`, {
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
    const fetchProfile = async () => {
      if (!userId) {
        setError('No user ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching profile for user ID:', userId, 'with applicationId:', applicationId);
        setError(null);
        setLoading(true);
        
        // Build the URL with applicationId as a query parameter if it exists
        const url = new URL(`http://localhost:5001/api/auth/profile/${userId}`);
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
      } catch (error: any) {
        console.error('Error in fetchProfile:', error);
        const errorMessage = error.message || 'Failed to load profile. Please try again.';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, applicationId, navigate, toast]);

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-primary" /> Contact Information
              </h2>
              <div className="space-y-2">
                <p className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                  <a href={`mailto:${profile.email}`} className="hover:underline">
                    {profile.email}
                  </a>
                </p>
                {profile.phone && (
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                    {profile.phone}
                  </p>
                )}
                {(profile.address || profile.city || profile.country) && (
                  <p className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <span>{[profile.address, profile.city, profile.country].filter(Boolean).join(', ')}</span>
                  </p>
                )}
                {profile.website && (
                  <p className="flex items-center">
                    <Globe className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />
                    <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="hover:underline text-blue-600">
                      {profile.website}
                    </a>
                  </p>
                )}
              </div>
            </div>

            {profile.skills && profile.skills.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {profile.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">About</h2>
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
