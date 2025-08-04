import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
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

const API_URL = 'https://jsearch.p.rapidapi.com/search?query=developer%20jobs%20in%20canada&page=1&num_pages=1&country=ca&date_posted=all';
const API_OPTIONS = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': '6e69e20a50mshf07727d408f0cc9p11790bjsn94f0092644fa',
    'x-rapidapi-host': 'jsearch.p.rapidapi.com',
  },
};

// Type for job and company info
interface Job {
  job_id: string;
  employer_name: string;
  job_title: string;
  job_city?: string;
  job_country?: string;
  job_description?: string;
  job_apply_link?: string;
  job_posted_at_datetime_utc?: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_salary_currency?: string;
  job_employment_type?: string;
  job_required_experience?: string;
  job_required_education?: string;
  job_benefits?: string;
}

interface Company {
  name: string;
  jobCount: number;
}

const FeaturedCompanies = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const jobTitleFilter = params.get("job_title")?.toLowerCase() || "";
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch external API and MongoDB concurrently
        const [extRes, mongoRes] = await Promise.all([
          fetch(API_URL, API_OPTIONS),
          fetch(`${API_BASE_URL}/jobs/public`)
        ]);

        if (!extRes.ok) throw new Error('Failed to fetch external jobs');
        if (!mongoRes.ok) throw new Error('Failed to fetch internal jobs');

        const extData = await extRes.json();
        const mongoData = await mongoRes.json();

        const extJobs: Job[] = Array.isArray(extData.data) ? extData.data : [];
        const mongoJobs: Job[] = (mongoData.success && Array.isArray(mongoData.data)) ? mongoData.data.map((j:any)=>({
          job_id: j._id,
          employer_name: j.company || 'Unknown',
          job_title: j.title,
          job_city: j.location,
          job_country: '',
          job_description: j.description,
        })) : [];

        // Merge both sources
        let combinedJobs: Job[] = [...extJobs, ...mongoJobs];

        // Apply optional title filter
        combinedJobs = jobTitleFilter
          ? combinedJobs.filter((j) => j.job_title.toLowerCase().includes(jobTitleFilter))
          : combinedJobs;

        setJobs(combinedJobs);

        // Group by company
        const companyMap: Record<string, number> = {};
        combinedJobs.forEach((job) => {
          const companyName = job.employer_name || 'Unknown';
          companyMap[companyName] = (companyMap[companyName] || 0) + 1;
        });
        const companiesArr: Company[] = Object.entries(companyMap).map(([name, jobCount]) => ({ name, jobCount }));
        setCompanies(companiesArr);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [jobTitleFilter]);

  if (loading) return <div className="text-center py-12">Loading featured companies...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
  if (companies.length === 0) return <div className="text-center py-12">No featured companies found.</div>;

  // If a company is selected, show its jobs
  if (selectedCompany) {
    const companyJobs = jobs.filter(job => job.employer_name === selectedCompany);
    return (
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={() => setSelectedCompany(null)} className="mr-4">Back to Companies</Button>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">{selectedCompany} Jobs</h2>
          </div>
          {companyJobs.length > 0 ? (
            <div className="space-y-6">
              {companyJobs.map((job) => (
                <Card key={job.job_id} className="border border-border bg-card">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground mb-1">{job.job_title}</h3>
                        <p className="text-muted-foreground mb-2">{job.job_city ? job.job_city + ', ' : ''}{job.job_country}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{job.job_description?.slice(0, 120)}...</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedJob(job)}>View Details</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{job.job_title}</DialogTitle>
                            <DialogDescription>
                              <div className="mt-2 text-left max-h-[60vh] overflow-y-auto pr-2">
                                <p><strong>Company:</strong> {job.employer_name}</p>
                                <p><strong>Location:</strong> {job.job_city ? job.job_city + ', ' : ''}{job.job_country}</p>
                                {job.job_employment_type && <p><strong>Type:</strong> {job.job_employment_type}</p>}
                                {job.job_posted_at_datetime_utc && <p><strong>Posted:</strong> {new Date(job.job_posted_at_datetime_utc).toLocaleDateString()}</p>}
                                {job.job_min_salary && <p><strong>Salary:</strong> {job.job_min_salary} - {job.job_max_salary} {job.job_salary_currency}</p>}
                                {job.job_required_experience && <p><strong>Experience:</strong> {job.job_required_experience}</p>}
                                {job.job_required_education && <p><strong>Education:</strong> {job.job_required_education}</p>}
                                {job.job_benefits && <p><strong>Benefits:</strong> {job.job_benefits}</p>}
                                <div className="mt-4">
                                  <strong>Description:</strong>
                                  <div className="whitespace-pre-line text-sm mt-1">{job.job_description}</div>
                                </div>
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            {job.job_apply_link && (
                              <a href={job.job_apply_link} target="_blank" rel="noopener noreferrer">
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

  // Main view - show companies
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Featured Companies</h2>
          <p className="text-lg text-muted-foreground">Browse top companies hiring {jobTitleFilter || 'developers'} in Chicago</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {companies.map((company) => (
            <Card key={company.name} className="hover:shadow-lg transition-shadow border border-border bg-card cursor-pointer h-40 flex flex-col" onClick={() => setSelectedCompany(company.name)}>
              <CardContent className="p-6 flex flex-col items-center justify-center flex-grow">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <span className="text-primary text-2xl font-bold">{company.name.charAt(0).toUpperCase()}</span>
                </div>
                <h3 className="text-lg font-semibold text-center text-foreground">{company.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{company.jobCount} {company.jobCount === 1 ? 'job' : 'jobs'} available</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCompanies; 