import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Clock, DollarSign, Calendar, Building, Globe, Mail, ArrowLeft, Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/config";
import { format } from 'date-fns';
import { JobApplicationForm } from "@/components/JobApplicationForm";

type JobDetails = {
  applyUrl: any;
  _id: string;
  // Basic Job Information
  title: string;
  type: string;
  workType: string;
  location: string;
  vacancies?: string;
  // Company Information
  company: string;
  companyWebsite?: string;
  companyDescription?: string;
  // Job Description
  description: string;
  responsibilities: string;
  requiredSkills: string;
  preferredQualifications?: string;
  experience: string;
  education?: string;
  // Compensation & Benefits
  salaryRange: string;
  benefits?: string;
  // Other Details
  applicationDeadline: string;
  startDate?: string;
  workHours: string;
  // Application Process
  howToApply: string;
  contactEmail: string;
  // System fields
  postedBy: string;
  date: string;
  applicants: Array<{
    user: string;
    appliedAt: string;
  }>;
};

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [job, setJob] = useState<JobDetails | null>(location.state?.job ?? null);
  const [loading, setLoading] = useState(location.state?.job ? false : true);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  useEffect(() => {
    // If job already available from navigation state, no need to fetch
    if (job) return;

    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`);

        if (!response.ok) throw new Error('Failed to fetch job');
        const data = await response.json();
        
        if (data.success) {
          setJob(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch job');
        }
      } catch (err) {
        console.error('Error fetching job:', err);
        toast({
          title: 'Error',
          description: 'Failed to load job details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, toast, job]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!job) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-5 w-5" />
                    <span>{job.company}</span>
                  </div>
                  <CardTitle className="text-3xl">{job.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Briefcase className="h-4 w-4" />
                      {job.type}
                    </Badge>
                  </div>
                </div>
                {job.applyUrl ? (
                  <a 
                    href={job.applyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Apply Now
                  </a>
                ) : (
                  <Button 
                    onClick={() => setIsApplicationOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Apply Now
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Company Information */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Company Information</h3>
                <div className="prose max-w-none text-gray-700">
                  <strong>Company Name:</strong> {job.company}<br />
                  {job.companyWebsite && (<><strong>Website:</strong> <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{job.companyWebsite}</a><br /></>)}
                  {job.companyDescription && (<><strong>Description:</strong> {job.companyDescription}<br /></>)}
                </div>
              </div>

              {/* Job Description */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Job Description</h3>
                <div className="prose max-w-none text-gray-700">
                  <div>
                    <strong>Overview:</strong> 
                    {job.description && job.description.length > 400 ? (
                      <div>
                        <p className="inline">
                          {job.description.substring(0, 400)}...
                        </p>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            const fullText = e.currentTarget.previousSibling as HTMLElement;
                            if (fullText.textContent?.includes('...')) {
                              fullText.textContent = job.description;
                              e.currentTarget.textContent = ' Show Less';
                            } else {
                              fullText.textContent = job.description.substring(0, 100) + '...';
                              e.currentTarget.textContent = ' Read More';
                            }
                          }}
                          className="ml-2 text-blue-600 hover:underline focus:outline-none"
                        >
                          Read More
                        </button>
                      </div>
                    ) : (
                      <p>{job.description || 'No description provided.'}</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <strong>Responsibilities:</strong> {job.responsibilities || 'Not specified'}<br />
                    <strong>Required Skills:</strong> {job.requiredSkills || 'Not specified'}<br />
                    {job.preferredQualifications && (<><strong>Preferred Qualifications:</strong> {job.preferredQualifications}<br /></>)}
                    <strong>Experience Required:</strong> {job.experience || 'Not specified'}<br />
                    {job.education && (<><strong>Education Level:</strong> {job.education}<br /></>)}
                  </div>
                </div>
              </div>

              {/* Compensation & Benefits */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Compensation & Benefits</h3>
                <div className="prose max-w-none text-gray-700">
                  <strong>Salary Range:</strong> {job.salaryRange}<br />
                  {job.benefits && (<><strong>Benefits:</strong> {job.benefits}<br /></>)}
                </div>
              </div>

              {/* Application Process */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Application Process</h3>
                <div className="prose max-w-none text-gray-700">
                  <strong>How to Apply:</strong> {job.howToApply}<br />
                  <strong>Contact Email:</strong> <a href={`mailto:${job.contactEmail}`} className="text-blue-600 hover:underline">{job.contactEmail}</a><br />
                  <strong>Application Deadline:</strong> {job.applicationDeadline}<br />
                  {job.startDate && (<><strong>Job Start Date:</strong> {job.startDate}<br /></>)}
                  <strong>Work Hours:</strong> {job.workHours}<br />
                  <strong>Location:</strong> {job.location}<br />
                  <strong>Job Type:</strong> {job.type}<br />
                  <strong>Work Type:</strong> {job.workType}<br />
                  {job.vacancies && (<><strong>Number of Vacancies:</strong> {job.vacancies}<br /></>)}
                </div>
              </div>

              {/* Posted Date and Applicants */}
              <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                <span>Posted on {new Date(job.date).toLocaleDateString()}</span>
                {job.applicants && job.applicants.length > 0 && (
                  <span>{job.applicants.length} {job.applicants.length === 1 ? 'applicant' : 'applicants'}</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {job && (
        <JobApplicationForm
          jobId={job._id}
          jobTitle={job.title}
          companyName={job.company}
          open={isApplicationOpen}
          onOpenChange={setIsApplicationOpen}
          onSuccess={() => {
            toast({
              title: 'Application Submitted',
              description: 'Your application has been submitted successfully!',
            });
          }}
        />
      )}
    </div>
  );
}
