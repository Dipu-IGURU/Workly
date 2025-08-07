import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign, Bookmark, ArrowLeft } from "lucide-react";
import { useJobs } from "@/contexts/JobsContext";

// Define job type
type Job = {
  _id: string;
  company: string;
  title: string;
  description: string;
  location: string;
  date: string;
  type: string;
};

type JobsResponse = {
  data: Job[];
  success: boolean;
};

const FeaturedJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { jobsVersion } = useJobs();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    resume: null as File | null,
    coverLetter: ''
  });

  // Group jobs by company with proper typing
  const companies = jobs.reduce<Record<string, Job[]>>((acc, job) => {
    if (!acc[job.company]) {
      acc[job.company] = [];
    }
    acc[job.company].push(job);
    return acc;
  }, {});

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/public`);
        if (response.ok) {
          const data: JobsResponse = await response.json().catch(() => ({ data: [], success: false }));
          if (data.success && Array.isArray(data.data)) {
            setJobs(data.data);
          } else {
            setJobs([]);
          }
        } else {
          console.error('Failed to fetch jobs:', response.status);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [jobsVersion]); // Re-fetch when jobsVersion changes

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Featured Companies
            </h2>
            <p className="text-lg text-muted-foreground">
              Loading companies...
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="animate-pulse h-32">
                <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                  <div className="w-12 h-12 bg-muted rounded-lg mb-2"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If a company is selected, show their jobs
  if (selectedCompany) {
    const companyJobs = companies[selectedCompany] || [];
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedCompany(null)}
              className="mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back to Companies
            </Button>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              {selectedCompany} Jobs
            </h2>
          </div>
          
          {companyJobs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {companyJobs.map((job) => (
                <Card key={job._id} className="hover:shadow-lg transition-shadow border border-border bg-job-card">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-lg">
                            {job.company.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-lg mb-1">
                            {job.title}
                          </h3>
                          <p className="text-muted-foreground">{job.company}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">
                        {job.type}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {job.description.substring(0, 120)}...
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(job.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                        {job.type}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => {
                        navigate(`/jobs/${job._id}`);
                      }}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No jobs available for this company.</p>
            </div>
          )}
        </div>
      </section>
    );
  }
  // Main view - show companies
  return (
    <>
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Featured Companies
            </h2>
            <p className="text-lg text-muted-foreground">
              {Object.keys(companies).length > 0 
                ? "Browse jobs by company" 
                : "No companies with job postings yet."}
            </p>
          </div>

          {Object.keys(companies).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Object.entries(companies).map(([companyName, companyJobs]) => (
                <Card 
                  key={companyName} 
                  className="hover:shadow-lg transition-shadow border border-border bg-card cursor-pointer h-40 flex flex-col"
                  onClick={() => setSelectedCompany(companyName)}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center flex-grow">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                      <span className="text-primary text-2xl font-bold">
                        {companyName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-center text-foreground">
                      {companyName}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {companyJobs.length} {companyJobs.length === 1 ? 'job' : 'jobs'} available
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No companies with job postings at the moment.
              </p>
            </div>
          )}
        </div>
      </section>
      
      {isApplicationOpen && selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setIsApplicationOpen(false)}>
          <div className="relative z-50 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsApplicationOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
            <h2 className="text-2xl font-bold mb-2">Apply for {selectedJob.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">at {selectedJob.company}</p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              // Basic validation
              if (!formData.fullName || !formData.email || !formData.phone || !formData.resume) {
                alert('Please fill in all required fields.');
                return;
              }
              try {
                // Optionally, you can still upload the resume/cover letter to another endpoint if needed
                const token = localStorage.getItem('token');
                if (!token) throw new Error('No authentication token found');
                const response = await fetch(`${API_BASE_URL}/jobs/${selectedJob._id}/apply`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to submit application');
                alert('Application submitted!');
                setFormData({ fullName: '', email: '', phone: '', resume: null, coverLetter: '' });
                setIsApplicationOpen(false);
              } catch (error) {
                alert('Failed to submit application. Please try again.');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName">Full Name *</label>
                  <input id="fullName" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="mt-1 w-full border rounded p-2" required />
                </div>
                <div>
                  <label htmlFor="email">Email *</label>
                  <input id="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="mt-1 w-full border rounded p-2" required />
                </div>
                <div>
                  <label htmlFor="phone">Phone *</label>
                  <input id="phone" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="mt-1 w-full border rounded p-2" required />
                </div>
                <div>
                  <label htmlFor="resume">Resume (PDF, DOC, DOCX) *</label>
                  <input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setFormData({ ...formData, resume: e.target.files[0] });
                    }
                  }} className="mt-1 w-full border rounded p-2" required />
                </div>
                <div>
                  <label htmlFor="coverLetter">Cover Letter</label>
                  <textarea id="coverLetter" value={formData.coverLetter} onChange={e => setFormData({ ...formData, coverLetter: e.target.value })} className="mt-1 w-full border rounded p-2" rows={6} placeholder="Tell us why you're a good fit for this position..." />
                </div>
              </div>
              <div className="mt-8 flex justify-end space-x-3">
                <button type="button" className="border rounded px-4 py-2" onClick={() => setIsApplicationOpen(false)}>Cancel</button>
                <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FeaturedJobs;