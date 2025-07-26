import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobApplication {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  date: string;
}

const JobAlerts: React.FC = () => {
  const [appliedJobs, setAppliedJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await fetch('http://localhost:5001/api/profile/applied-jobs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.jobs)) {
          setAppliedJobs(
            data.jobs.map((item: any) => ({
              id: item.job._id,
              title: item.job.title,
              company: item.job.company,
              location: item.job.location,
              type: item.job.type,
              date: item.appliedAt,
            }))
          );
        }
      } catch (err) {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    };
    fetchAppliedJobs();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Job Alerts (Applied Jobs)</h1>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>All Applied Jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : appliedJobs.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">You have not applied to any jobs yet.</div>
          ) : (
            <div className="divide-y">
              {appliedJobs.map((job) => (
                <div key={job.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.company}</p>
                        <div className="flex items-center mt-1 text-xs text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(job.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge className={cn("text-xs", "bg-blue-100 text-blue-800")}>Applied</Badge>
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

export default JobAlerts;
