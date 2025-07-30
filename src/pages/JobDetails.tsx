import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Clock, DollarSign, Calendar, Building, Globe, Mail, ArrowLeft, Users } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { JobApplicationForm } from "@/components/JobApplicationForm";

type JobDetails = {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
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
  const { toast } = useToast();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/jobs/${id}`);

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
  }, [id, toast]);

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
                <Button 
                  onClick={() => setIsApplicationOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Apply Now
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Job Description</h3>
                <div className="prose max-w-none">
                  {job.description}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Requirements</h3>
                <div className="prose max-w-none">
                  {job.requirements}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Posted: {new Date(job.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Job Type: {job.type}</span>
                </div>
                {job.applicants && job.applicants.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>{job.applicants.length} {job.applicants.length === 1 ? 'applicant' : 'applicants'}</span>
                  </div>
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
