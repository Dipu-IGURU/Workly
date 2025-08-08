import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from '@/lib/api';
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase,
  MapPin,
  Clock,
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  Clock as ClockIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobApplication {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status: string;
  date: string;
  salary?: string;
  description?: string;
  requirements?: string[];
}

const AppliedJobs = () => {
  const [appliedJobs, setAppliedJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/profile/applied-jobs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.jobs)) {
          setAppliedJobs(
            data.jobs.map((item: any) => ({
              id: item.job?._id || item._id,
              title: item.job?.title || 'No Title',
              company: item.job?.company || 'No Company',
              location: item.job?.location || 'Location not specified',
              type: item.job?.type || 'Full-time',
              status: item.status || 'applied',
              date: item.appliedAt || new Date().toISOString(),
              description: item.job?.description,
              requirements: item.job?.requirements
            }))
          );
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to fetch applied jobs",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching applied jobs:', error);
        toast({
          title: "Error",
          description: "An error occurred while fetching your applied jobs.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, [navigate, toast]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Applied</Badge>;
      case 'interview':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Interview</Badge>;
      case 'shortlisted':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Shortlisted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">Applied Jobs</h1>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Job Applications</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {appliedJobs.length} {appliedJobs.length === 1 ? 'application' : 'applications'} found
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {appliedJobs.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No applications yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                You haven't applied to any jobs yet. Start your job search today!
              </p>
              <Button onClick={() => navigate('/jobs')}>
                Browse Jobs
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {appliedJobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex space-x-4">
                      <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium">{job.title}</h3>
                          {getStatusBadge(job.status)}
                        </div>
                        <p className="text-sm font-medium text-gray-700 mt-1">{job.company}</p>
                        
                        <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 gap-x-4 gap-y-1">
                          <span className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                            {job.type}
                          </span>
                          <span className="flex items-center">
                            <ClockIcon className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                            Applied on {formatDate(job.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex items-start space-x-2">
                      <Button variant="outline" size="sm" className="mt-2 md:mt-0">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppliedJobs;
