import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign, Bookmark } from "lucide-react";
import { useJobs } from "@/contexts/JobsContext";

const FeaturedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { jobsVersion } = useJobs();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    resume: null as File | null,
    coverLetter: ''
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/jobs/public');
        if (response.ok) {
          const data = await response.json().catch(() => ({ data: [] }));
          setJobs(data.data || []);
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
              Featured Jobs
            </h2>
            <p className="text-lg text-muted-foreground">
              Loading amazing opportunities...
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-muted rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-48"></div>
                        <div className="h-3 bg-muted rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Featured Jobs
          </h2>
          <p className="text-lg text-muted-foreground">
            {jobs.length > 0 ? "Know your worth and find the job that qualify your life" : "No jobs posted yet. Be the first to post a job!"}
          </p>
        </div>

        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.slice(0, 6).map((job) => (
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
                      setSelectedJob(job);
                      setIsApplicationOpen(true);
                    }}>
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No jobs available at the moment.</p>
          </div>
        )}

        {jobs.length > 6 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Listings
            </Button>
          </div>
        )}
      </div>
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
                const response = await fetch(`http://localhost:5001/api/jobs/${selectedJob._id}/apply`, {
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
    </section>
  );
};

export default FeaturedJobs;