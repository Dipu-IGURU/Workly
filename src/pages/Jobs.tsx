import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, ExternalLink } from "lucide-react";
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
  isExternal?: boolean;
  applyLink?: string;
  postedAt?: string;
  workType?: string;
  responsibilities?: string;
  requiredSkills?: string;
  experience?: string;
  applyUrl?: string;
  date?: string;
  postedBy?: string;
  applicants?: any[];
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const category = params.get("category") ?? "";

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch jobs from your API
        const url = category
          ? `${API_BASE_URL}/jobs/public?category=${encodeURIComponent(category)}`
          : `${API_BASE_URL}/jobs/public`;
        
        console.log('Fetching jobs...');
        console.log('RapidAPI Key:', import.meta.env.VITE_RAPIDAPI_KEY ? 'Exists' : 'Missing');
        console.log('RapidAPI Host:', import.meta.env.VITE_RAPIDAPI_HOST);

        // Fetch both MongoDB and JSearch API jobs in parallel
        const [mongoRes, apiRes] = await Promise.all([
          // MongoDB jobs
          fetch(url).catch(err => {
            console.error('Error fetching MongoDB jobs:', err);
            return { ok: false, json: () => ({ jobs: [] }), status: 500 };
          }),
          
          // JSearch API jobs
          fetch(
            `https://${import.meta.env.VITE_RAPIDAPI_HOST}/search?query=${encodeURIComponent(
              category || 'developer'
            )}%20jobs%20in%20chicago&page=1&num_pages=1&country=us&date_posted=all`,
            {
              method: 'GET',
              headers: {
                'x-rapidapi-key': import.meta.env.VITE_RAPIDAPI_KEY,
                'x-rapidapi-host': import.meta.env.VITE_RAPIDAPI_HOST
              }
            }
          ).catch(err => {
            console.error('Error fetching JSearch API:', err);
            return { ok: false, json: () => ({ data: [] }), status: 500 };
          })
        ]);

        // Process MongoDB jobs
        let mongoJobs: Job[] = [];
        if (mongoRes.ok) {
          const mongoData = await mongoRes.json();
          mongoJobs = Array.isArray(mongoData.jobs) ? mongoData.jobs : [];
        } else {
          console.error('Failed to fetch MongoDB jobs:', mongoRes.status);
        }

        // Process JSearch API jobs
        let apiJobs: any[] = [];
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          console.log('JSearch API Response:', apiData);
          apiJobs = Array.isArray(apiData.data) ? apiData.data : [];
        } else {
          const errorData = await apiRes.json().catch(() => ({}));
          console.error('Failed to fetch JSearch jobs:', apiRes.status, errorData);
        }

        // Format JSearch API jobs to match our Job interface
        const formattedApiJobs = apiJobs.map((job: any) => {
          const salaryRange = (() => {
            const hasMinSalary = job.job_min_salary !== undefined && job.job_min_salary !== null;
            const hasMaxSalary = job.job_max_salary !== undefined && job.job_max_salary !== null;
            
            if (!hasMinSalary && !hasMaxSalary) return 'Salary not specified';
            
            const format = (val: any) => {
              if (val === undefined || val === null) return '';
              if (typeof val === 'number') return `$${val.toLocaleString()}`;
              if (!isNaN(Number(val))) return `$${Number(val).toLocaleString()}`;
              return val.toString().startsWith('$') ? val : `$${val}`;
            };
            
            const min = format(job.job_min_salary);
            const max = format(job.job_max_salary);
            const currency = job.job_salary_currency || '';
            
            if (min && max) return `${min} - ${max} ${currency}`.trim();
            if (min) return `From ${min} ${currency}`.trim();
            if (max) return `Up to ${max} ${currency}`.trim();
            return 'Salary not specified';
          })();

          return {
            _id: job.job_id || `ext-${Math.random().toString(36).substr(2, 9)}`,
            title: job.job_title || 'No Title',
            company: job.employer_name || 'Company Not Specified',
            location: [job.job_city, job.job_country].filter(Boolean).join(', ') || 'Location Not Specified',
            type: job.job_employment_type || 'Full-time',
            salaryRange,
            description: job.job_description || 'No description available',
            isExternal: true,
            applyLink: job.job_apply_link,
            postedAt: job.job_posted_at_datetime_utc || new Date().toISOString(),
            workType: job.job_is_remote ? 'Remote' : 'On-site',
            responsibilities: Array.isArray(job.job_highlights?.responsibilities)
              ? job.job_highlights.responsibilities.join('\n• ')
              : 'Not specified',
            requiredSkills: Array.isArray(job.job_highlights?.skills)
              ? job.job_highlights.skills.join(', ')
              : 'Not specified',
            experience: job.job_required_experience?.required_experience_in_months
              ? `${Math.floor(job.job_required_experience.required_experience_in_months / 12)}+ years`
              : 'Not specified',
            applyUrl: job.job_apply_link || (job.apply_options?.[0]?.apply_link || '')
          };
        });

        // Combine and filter jobs
        const allJobs = [...mongoJobs, ...formattedApiJobs];
        const jobTitleQuery = params.get("job_title")?.toLowerCase() || params.get("title")?.toLowerCase();
        const filteredJobs = jobTitleQuery
          ? allJobs.filter(job => job.title.toLowerCase().includes(jobTitleQuery))
          : allJobs;

        setJobs(filteredJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [category, params]);

  // Render job cards
  const renderJobCards = () => {
    if (loading) {
      return <p className="text-center py-8">Loading jobs...</p>;
    }

    if (error) {
      return <p className="text-center text-red-500 py-8">{error}</p>;
    }

    if (jobs.length === 0) {
      return <p className="text-center py-8">No jobs found. Try adjusting your search criteria.</p>;
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <Card key={job._id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                  <p className="text-muted-foreground mb-2">{job.company}</p>
                </div>
                {job.isExternal && (
                  <Badge variant="outline" className="text-xs">
                    External
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                <MapPin className="h-4 w-4 mr-1" />
                {job.location}
              </div>
              
              <p className="text-sm mb-4 line-clamp-3">
                {job.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">
                  {job.type}
                </Badge>
                {job.workType && (
                  <Badge variant="outline">
                    {job.workType}
                  </Badge>
                )}
                {job.salaryRange && (
                  <div className="flex items-center text-sm text-green-600">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {job.salaryRange}
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(job.postedAt || '').toLocaleDateString()}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild={!!job.applyLink}
                >
                  {job.applyLink ? (
                    <a 
                      href={job.applyLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      Apply Now <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  ) : (
                    <span>View Details</span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <section className="min-h-screen py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-foreground">
          {category ? `Jobs in ${category}` : "All Jobs"}
        </h1>
        {renderJobCards()}
      </div>
    </section>
  );
}
