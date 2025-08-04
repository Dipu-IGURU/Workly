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
      setLoading(true);
      setError(null);
      try {
        setLoading(true);
        const url = category
          ? `${API_BASE_URL}/jobs/public?category=${encodeURIComponent(category)}`
          : `${API_BASE_URL}/jobs/public`;
        const [mongoRes, apiRes] = await Promise.all([
          fetch(url),
          fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(category || 'developer')}%20jobs%20in%20canada&page=1&num_pages=1&country=ca&date_posted=all`, {
            method: 'GET',
            headers: {
              'x-rapidapi-key': '6e69e20a50mshf07727d408f0cc9p11790bjsn94f0092644fa',
              'x-rapidapi-host': 'jsearch.p.rapidapi.com'
            }
          })
        ]);
        const data = await mongoRes.json();
        const apiData = await apiRes.json();
        if (data.success) {
          // Optional filtering by job_title query param
          const jobTitleQuery = params.get("job_title")?.toLowerCase() || params.get("title")?.toLowerCase();
          const filteredJobs = jobTitleQuery
            ? data.data.filter((j: Job) => j.title.toLowerCase().includes(jobTitleQuery))
            : data.data;
          // Map API jobs to common interface with all required fields
          const apiJobs: Job[] = Array.isArray(apiData.data) ? apiData.data.map((j:any) => ({
            _id: j.job_id,
            title: j.job_title,
            company: j.employer_name,
            location: j.job_city || j.job_country || 'Remote',
            type: j.job_employment_type || 'Full-time',
            workType: j.job_is_remote ? 'Remote' : 'On-site',
            // Salary information - handle both string and number formats
            salaryRange: (() => {
              // Check if we have any salary data
              const hasMinSalary = j.job_min_salary !== undefined && j.job_min_salary !== null;
              const hasMaxSalary = j.job_max_salary !== undefined && j.job_max_salary !== null;
              const hasSalaryRange = hasMinSalary || hasMaxSalary;
              
              if (!hasSalaryRange) return 'Salary not specified';
              
              // Format the salary values
              const formatSalary = (value: any) => {
                if (value === undefined || value === null) return '';
                // If it's a number, format with commas
                if (typeof value === 'number') {
                  return `$${value.toLocaleString()}`;
                }
                // If it's a string, check if it's a number
                if (!isNaN(Number(value))) {
                  return `$${Number(value).toLocaleString()}`;
                }
                // Otherwise, return as is with $ prefix if it doesn't have one
                return value.toString().startsWith('$') ? value : `$${value}`;
              };
              
              const min = formatSalary(j.job_min_salary);
              const max = formatSalary(j.job_max_salary);
              const currency = j.job_salary_currency || '';
              const period = j.job_salary_period ? `per ${j.job_salary_period.toLowerCase()}` : '';
              
              // Build the salary string
              let salaryStr = '';
              if (min && max) {
                salaryStr = `${min} - ${max}`;
              } else if (min) {
                salaryStr = `From ${min}`;
              } else if (max) {
                salaryStr = `Up to ${max}`;
              }
              
              // Add currency and period if available
              return [salaryStr, currency, period].filter(Boolean).join(' ');
            })(),
            // Job description and details
            description: j.job_description || 'No description provided.',
            howToApply: j.job_apply_link ? 'Click the Apply Now button to apply' : 'Apply through the company website',
            contactEmail: j.employer_website ? `careers@${j.employer_website.replace(/^https?:\/\//, '')}` : 'N/A',
            // Application details
            applicationDeadline: j.job_offer_expiration_datetime_utc 
              ? new Date(j.job_offer_expiration_datetime_utc).toLocaleDateString() 
              : 'Not specified',
            workHours: j.job_schedule_type || 'Standard business hours',
            // Job requirements
            responsibilities: Array.isArray(j.job_highlights?.responsibilities) 
              ? j.job_highlights.responsibilities.join('\n• ') 
              : (j.job_highlights?.responsibilities || 'Not specified'),
            requiredSkills: Array.isArray(j.job_highlights?.skills)
              ? j.job_highlights.skills.join(', ')
              : (j.job_highlights?.skills || 'Not specified'),
            experience: j.job_highlights?.experience || j.job_required_experience?.required_experience_in_months 
              ? `${Math.floor(j.job_required_experience.required_experience_in_months / 12)}+ years` 
              : 'Not specified',
            // Metadata
            date: j.job_posted_at_timestamp 
              ? new Date(j.job_posted_at_timestamp * 1000).toISOString() 
              : new Date().toISOString(),
            postedBy: j.employer_name || 'Company',
            applicants: [],
            // Application link (direct or from apply_options)
            applyUrl: j.job_apply_link || (j.apply_options?.[0]?.apply_link || '')
          })) : [];

          const merged = [...filteredJobs, ...apiJobs];
          setJobs(merged);
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
              onClick={() => navigate(`/jobs/${job._id}`, { state: { job } })}
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
