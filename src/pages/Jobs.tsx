import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/api";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

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

interface Company {
  name: string;
  jobCount: number;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'jobs' | 'companies'>('companies');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
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

        // Generate companies data
        const companyMap: Record<string, number> = {};
        filteredJobs.forEach((job) => {
          const companyName = job.company || 'Unknown';
          companyMap[companyName] = (companyMap[companyName] || 0) + 1;
        });
        const companiesArr: Company[] = Object.entries(companyMap).map(([name, jobCount]) => ({ name, jobCount }));
        setCompanies(companiesArr);
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

  // Generate a color based on company name for consistent branding
  const getCompanyColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-emerald-500 to-emerald-600',
      'bg-gradient-to-br from-amber-500 to-amber-600',
      'bg-gradient-to-br from-rose-500 to-rose-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Get company logo URL using Clearbit API
  const getCompanyLogoUrl = (companyName: string) => {
    // Simple domain extraction (you might want to enhance this)
    const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `https://logo.clearbit.com/${domain}.com?size=128`;
  };

  // Component for company logo with fallback to initials
  const CompanyLogo = ({ name, className = '' }: { name: string; className?: string }) => {
    const [logoError, setLogoError] = useState(false);
    const logoUrl = getCompanyLogoUrl(name);
    const bgColor = getCompanyColor(name);
    
    if (logoError || !logoUrl) {
      return (
        <div className={`${bgColor} ${className} rounded-xl flex items-center justify-center text-white font-bold text-2xl`}>
          {name.charAt(0).toUpperCase()}
        </div>
      );
    }

    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={`${className} rounded-xl object-cover`}
        onError={() => setLogoError(true)}
      />
    );
  };

  // Render company cards with premium design
  const renderCompanyCards = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse flex space-x-4 w-full max-w-4xl">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 space-y-4 py-1">
                <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Something went wrong</h3>
          <p className="text-gray-500 dark:text-gray-400">We're having trouble loading companies. Please try again later.</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </Button>
        </div>
      );
    }

    if (companies.length === 0) {
      return (
        <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="mx-auto w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No companies found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">We couldn't find any companies matching your search. Try adjusting your filters.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {companies.map((company) => (
          <div 
            key={company.name} 
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-900/50 hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col"
            onClick={() => setSelectedCompany(company.name)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative p-6 flex-1 flex flex-col">
              <div className="w-16 h-16 mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <CompanyLogo name={company.name} className="w-full h-full" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                  {company.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {company.jobCount} {company.jobCount === 1 ? 'open position' : 'open positions'}
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {company.jobCount > 5 ? 'Hiring' : 'Active'}
                </span>
                <span className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors duration-300">
                  View jobs →
                </span>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
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

  // If a company is selected, show its jobs
  if (selectedCompany) {
    const companyJobs = jobs.filter(job => job.company === selectedCompany);
    return (
      <section className="min-h-screen py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={() => setSelectedCompany(null)} className="mr-4">Back to {viewMode === 'companies' ? 'Companies' : 'Jobs'}</Button>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">{selectedCompany} Jobs</h2>
          </div>
          {companyJobs.length > 0 ? (
            <div className="space-y-6">
              {companyJobs.map((job) => (
                <Card key={job._id} className="border border-border bg-card">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground mb-1">{job.title}</h3>
                        <p className="text-muted-foreground mb-2">{job.location}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{job.description?.slice(0, 120)}...</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedJob(job)}>View Details</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{job.title}</DialogTitle>
                            <DialogDescription>
                              <div className="mt-2 text-left max-h-[60vh] overflow-y-auto pr-2">
                                <p><strong>Company:</strong> {job.company}</p>
                                <p><strong>Location:</strong> {job.location}</p>
                                {job.type && <p><strong>Type:</strong> {job.type}</p>}
                                {job.postedAt && <p><strong>Posted:</strong> {new Date(job.postedAt).toLocaleDateString()}</p>}
                                {job.salaryRange && job.salaryRange !== 'Salary not specified' && <p><strong>Salary:</strong> {job.salaryRange}</p>}
                                {job.experience && job.experience !== 'Not specified' && <p><strong>Experience:</strong> {job.experience}</p>}
                                {job.requiredSkills && job.requiredSkills !== 'Not specified' && <p><strong>Skills:</strong> {job.requiredSkills}</p>}
                                <div className="mt-4">
                                  <strong>Description:</strong>
                                  <div className="whitespace-pre-line text-sm mt-1">{job.description}</div>
                                </div>
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            {job.applyLink && (
                              <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                                <Button type="button">Apply</Button>
                              </a>
                            )}
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">Close</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">No jobs found for this company.</div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-12 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
            {getPageTitle()}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Explore top companies hiring {category ? `for ${category}` : 'now'}. Find your dream job with the best employers in the industry.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {loading ? "Searching..." : `Showing ${companies.length} compan${companies.length !== 1 ? 'ies' : 'y'}`}
              </div>
              {(jobTitle || searchLocation) && (
                <div className="flex flex-wrap gap-2">
                  {jobTitle && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {jobTitle}
                    </Badge>
                  )}
                  {searchLocation && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {searchLocation}
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                    onClick={() => {
                      // Reset search
                      navigate('/jobs');
                    }}
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                Sort
              </Button>
            </div>
          </div>
        </div>
        
        {/* Company Grid */}
        <div className="mb-12">
          {renderCompanyCards()}
        </div>
        
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Can't find your company?</h3>
          <p className="text-blue-100 max-w-2xl mx-auto mb-6">
            We're constantly adding new companies and job opportunities. Sign up for job alerts and be the first to know about new positions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-2 rounded-lg border border-blue-400 bg-white/10 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <Button className="bg-white text-blue-600 hover:bg-blue-50 font-medium">
              Get Job Alerts
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
