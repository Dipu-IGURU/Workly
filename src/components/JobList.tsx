import { useEffect, useState } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Briefcase, MapPin, Clock, Calendar, Users, Pencil, Trash2 } from 'lucide-react';
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
          <CardFooter className="pt-1">
            <Button variant="link" size="sm" className="px-0">
              View details →
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
