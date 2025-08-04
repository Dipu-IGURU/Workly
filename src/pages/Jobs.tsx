import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salaryRange?: string;
  description: string;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Get category from query string
  const params = new URLSearchParams(location.search);
  const category = params.get("category") ?? "";

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const url = category
          ? `${API_BASE_URL}/jobs/public?category=${encodeURIComponent(category)}`
          : `${API_BASE_URL}/jobs/public`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          // Optional filtering by job_title query param
          const jobTitleQuery = params.get("job_title")?.toLowerCase() || params.get("title")?.toLowerCase();
          const filteredJobs = jobTitleQuery
            ? data.data.filter((j: Job) => j.title.toLowerCase().includes(jobTitleQuery))
            : data.data;
          setJobs(filteredJobs);
        } else {
          setError("Failed to load jobs");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [category]);

  return (
    <section className="min-h-screen py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-foreground">
          {category ? `Jobs in ${category}` : "All Jobs"}
        </h1>
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && jobs.length === 0 && <p>No jobs found.</p>}
        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card
              key={job._id}
              onClick={() => navigate(`/jobs/${job._id}`)}
              className="cursor-pointer hover:shadow-lg transition-shadow border border-border bg-job-card"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-foreground">
                    {job.title}
                  </h3>
                  {job.salaryRange && (
                    <span className="flex items-center text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {job.salaryRange}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground line-clamp-2">
                  {job.description}
                </p>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" /> {job.location}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {job.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
