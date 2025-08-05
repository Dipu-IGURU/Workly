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

// Helper function to map categories to better search terms for JSearch API
const getCategorySearchTerm = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    'Development': 'software developer',
    'Design': 'designer',
    'Marketing': 'marketing',
    'Sales': 'sales',
    'Finance': 'finance',
    'HR': 'human resources',
    'Operations': 'operations',
    'Customer Service': 'customer service',
    'Engineering': 'engineer',
    'Data Science': 'data scientist',
    'Product': 'product manager',
    'QA': 'quality assurance',
    'DevOps': 'devops',
    'Security': 'security',
    'Mobile': 'mobile developer',
    'Frontend': 'frontend developer',
    'Backend': 'backend developer',
    'Fullstack': 'fullstack developer',
    'UI/UX': 'ui ux designer',
    'Analytics': 'analyst'
  };
  
  return categoryMap[category] || category.toLowerCase();
};

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const category = params.get("category") ?? "";
  const jobTitle = params.get("job_title") ?? "";
  const searchLocation = params.get("location") ?? "";

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch jobs from your API
        const url = category
          ? `${API_BASE_URL}/jobs/public?category=${encodeURIComponent(category)}`
          : `${API_BASE_URL}/jobs/public`;
        
        // Fetch jobs from both MongoDB and JSearch API

        // Fetch both MongoDB and JSearch API jobs in parallel
        const [mongoRes, apiRes] = await Promise.all([
          // MongoDB jobs
          fetch(url).catch(err => {
            console.error('Error fetching MongoDB jobs:', err);
            return { ok: false, json: () => ({ jobs: [] }), status: 500 };
          }),
          
          // JSearch API jobs - Updated for US (Chicago default)
          fetch(
            `https://${import.meta.env.VITE_RAPIDAPI_HOST}/search?query=${encodeURIComponent(
              jobTitle || getCategorySearchTerm(category) || 'developer'
            )}%20jobs%20in%20${encodeURIComponent(searchLocation || 'chicago')}&page=1&num_pages=1&country=us&date_posted=all`,
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
          if (apiData.data && Array.isArray(apiData.data)) {
            apiJobs = apiData.data;
          } else {
            console.warn('JSearch API response does not contain expected data array');
          }
        } else {
          try {
            const errorData = await apiRes.json();
            console.error('Failed to fetch JSearch jobs:', apiRes.status, errorData);
          } catch (jsonError) {
            console.error('Failed to fetch JSearch jobs:', apiRes.status, 'Unable to parse error response');
          }
        }

        // Format JSearch API jobs to match our Job interface
        let formattedApiJobs: Job[] = [];
        try {
          formattedApiJobs = apiJobs.map((job: any, index: number) => {
            try {
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

              const formattedJob = {
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
              
              return formattedJob;
            } catch (jobError) {
              console.error(`Error formatting job ${index + 1}:`, jobError, job);
              return null;
            }
          }).filter(Boolean) as Job[];
        } catch (formatError) {
          console.error('Error during job formatting:', formatError);
          formattedApiJobs = [];
        }

        // Combine and filter jobs
        const allJobs = [...mongoJobs, ...formattedApiJobs];
        
        // Apply filters
        let filteredJobs = allJobs;
        
        // Filter by job title/keywords
        if (jobTitle) {
          const titleQuery = jobTitle.toLowerCase();
          filteredJobs = filteredJobs.filter(job =>
            job.title.toLowerCase().includes(titleQuery) ||
            job.description.toLowerCase().includes(titleQuery) ||
            job.company.toLowerCase().includes(titleQuery)
          );
        }
        
        // Filter by location
        if (searchLocation) {
          const locationQuery = searchLocation.toLowerCase();
          filteredJobs = filteredJobs.filter(job =>
            job.location.toLowerCase().includes(locationQuery) ||
            job.location.toLowerCase().includes(locationQuery.split(',')[0]) // Match city part
          );
        }

        setJobs(filteredJobs);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [category, jobTitle, searchLocation]);

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
          <Card key={job._id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1 text-gray-900 line-clamp-2">{job.title}</h3>
                  <p className="text-blue-600 font-semibold mb-1">{job.company}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {job.isExternal && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      External
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <MapPin className="h-4 w-4 mr-1 text-red-500" />
                <span className="font-medium">{job.location}</span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                  {job.description.length > 150
                    ? `${job.description.substring(0, 150)}...`
                    : job.description}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {job.type}
                </Badge>
                {job.workType && (
                  <Badge variant="outline" className="border-purple-200 text-purple-700">
                    {job.workType}
                  </Badge>
                )}
                {job.experience && job.experience !== 'Not specified' && (
                  <Badge variant="outline" className="border-orange-200 text-orange-700">
                    {job.experience}
                  </Badge>
                )}
              </div>

              {job.salaryRange && job.salaryRange !== 'Salary not specified' && (
                <div className="flex items-center text-sm font-semibold text-green-600 mb-3 bg-green-50 p-2 rounded-md">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {job.salaryRange}
                </div>
              )}

              {job.requiredSkills && job.requiredSkills !== 'Not specified' && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Required Skills:</p>
                  <p className="text-xs text-gray-700 line-clamp-2">{job.requiredSkills}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(job.postedAt || '').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
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
                    <span onClick={() => navigate(`/job/${job._id}`)} className="cursor-pointer">
                      View Details
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const getPageTitle = () => {
    if (jobTitle && searchLocation) {
      return `${jobTitle} Jobs in ${searchLocation}`;
    } else if (jobTitle) {
      return `${jobTitle} Jobs in Chicago`;
    } else if (searchLocation) {
      return `Jobs in ${searchLocation}`;
    } else if (category) {
      return `Jobs in ${category}`;
    }
    return "All Jobs in Chicago";
  };

  return (
    <section className="min-h-screen py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">
            {getPageTitle()}
          </h1>
          {(jobTitle || searchLocation) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {jobTitle && (
                <Badge variant="secondary" className="text-sm">
                  Keyword: {jobTitle}
                </Badge>
              )}
              {searchLocation && (
                <Badge variant="secondary" className="text-sm">
                  Location: {searchLocation}
                </Badge>
              )}
            </div>
          )}
          <p className="text-muted-foreground">
            {loading ? "Searching..." : `Found ${jobs.length} job${jobs.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {renderJobCards()}
      </div>
    </section>
  );
}
