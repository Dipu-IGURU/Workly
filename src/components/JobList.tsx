import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Briefcase, Calendar, Users, Pencil, Trash2, Send, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  createdAt: string;
  applicants?: number;
}

interface JobListProps {
  jobs: Job[];
  onEdit?: (job: Job) => void;
  onDelete?: (jobId: string) => void;
  showActions?: boolean;
}

export function JobList({ jobs, onEdit, onDelete, showActions = true }: JobListProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState<{id: string, title: string, company: string} | null>(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    resume: null as File | null,
    coverLetter: ''
  });
  const formRef = useRef<HTMLDivElement>(null);

  const handleApplyClick = (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    console.log('1. Apply Now button clicked for job:', job.title);
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    console.log('2. Token exists:', !!token);
    
    if (!token) {
      console.log('3. No token found, redirecting to login');
      toast({
        title: 'Please Login',
        description: 'You need to log in to apply for jobs',
        variant: 'destructive'
      });
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    // Set the selected job and open the form
    console.log('3. Setting selected job and opening application form');
    setSelectedJob({
      id: job._id,
      title: job.title,
      company: job.company
    });
    console.log('4. Setting isApplicationOpen to true');
    setIsApplicationOpen(true);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5001/api/jobs/${jobId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete job');
        }

        toast({
          title: "Success",
          description: "Job posting deleted successfully.",
        });

        if (onDelete) {
          onDelete(jobId);
        }
      } catch (error: any) {
        console.error('Error deleting job:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to delete job posting.",
          variant: "destructive",
        });
      }
    }
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">No jobs posted yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by creating a new job posting.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job._id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {job.type}
                  </Badge>
                </div>
                <CardDescription className="mt-1">
                  {job.company} • {job.location}
                </CardDescription>
              </div>
              {showActions && (
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEdit) onEdit(job);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => handleDelete(job._id, e)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {job.description}
            </p>
            <div className="mt-3 flex items-center text-xs text-muted-foreground space-x-4">
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Posted {formatDate(job.createdAt)}
              </div>
              {job.applicants !== undefined && (
                <div className="flex items-center">
                  <Users className="h-3.5 w-3.5 mr-1.5" />
                  {job.applicants} {job.applicants === 1 ? 'applicant' : 'applicants'}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-1 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              className="z-10 relative hover:bg-primary hover:text-primary-foreground"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/jobs/${job._id}`);
              }}
            >
              <Briefcase className="mr-2 h-4 w-4" /> View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
      
      {isApplicationOpen && selectedJob && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setIsApplicationOpen(false)}
        >
          <div 
            ref={formRef}
            className="relative z-50 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4 h-8 w-8 p-0"
              onClick={() => setIsApplicationOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <h2 className="text-2xl font-bold mb-2">Apply for {selectedJob.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">at {selectedJob.company}</p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input 
                  id="fullName" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="mt-1 w-full" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="mt-1 w-full" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="mt-1 w-full" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="resume">Resume (PDF, DOC, DOCX) *</Label>
                <Input 
                  id="resume" 
                  type="file" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData({...formData, resume: e.target.files[0]});
                    }
                  }}
                  className="mt-1 w-full" 
                  accept=".pdf,.doc,.docx" 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="coverLetter">Cover Letter</Label>
                <Textarea 
                  id="coverLetter" 
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({...formData, coverLetter: e.target.value})}
                  className="mt-1 w-full" 
                  rows={6} 
                  placeholder="Tell us why you're a good fit for this position..."
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-3">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setIsApplicationOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={async () => {
                  // Basic validation
                  if (!formData.fullName || !formData.email || !formData.phone || !formData.resume) {
                    toast({
                      title: 'Missing Information',
                      description: 'Please fill in all required fields.',
                      variant: 'destructive',
                    });
                    return;
                  }

                  try {
                    // Create form data for file upload
                    const formDataToSend = new FormData();
                    formDataToSend.append('jobId', selectedJob.id);
                    formDataToSend.append('fullName', formData.fullName);
                    formDataToSend.append('email', formData.email);
                    formDataToSend.append('phone', formData.phone);
                    formDataToSend.append('coverLetter', formData.coverLetter);
                    if (formData.resume) {
                      formDataToSend.append('resume', formData.resume);
                    }

                    // Get token from localStorage
                    const token = localStorage.getItem('token');
                    if (!token) {
                      throw new Error('No authentication token found');
                    }

                    // Send application
                    const response = await fetch('/api/jobs/apply', {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`
                      },
                      body: formDataToSend
                    });

                    if (!response.ok) {
                      throw new Error('Failed to submit application');
                    }

                    // Show success message
                    toast({
                      title: 'Application Submitted!',
                      description: `Your application for ${selectedJob.title} at ${selectedJob.company} has been received.`,
                    });

                    // Reset form and close dialog
                    setFormData({
                      fullName: '',
                      email: '',
                      phone: '',
                      resume: null,
                      coverLetter: ''
                    });
                    setIsApplicationOpen(false);

                  } catch (error) {
                    console.error('Error submitting application:', error);
                    toast({
                      title: 'Error',
                      description: 'Failed to submit application. Please try again.',
                      variant: 'destructive',
                    });
                  }
                }}
              >
                Submit Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
