import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/config";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  XCircle,
  Search,
  Filter,
  X,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface ShortlistedJob {
  id: string;
  job: {
    _id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    description: string;
    requirements: string[];
    postedDate: string;
  };
  shortlistedDate: string;
  status: 'applied' | 'interview' | 'rejected' | 'accepted';
  matchScore: number;
}

const ShortlistedJobs: React.FC = () => {
  const [shortlistedJobs, setShortlistedJobs] = useState<ShortlistedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShortlistedJobs = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/jobs/shortlisted`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Transform the API response to match our ShortlistedJob interface
          const jobs = data.data.map((job: any) => ({
            id: job._id,
            job: {
              _id: job._id,
              title: job.title || 'No title',
              company: job.company || 'Company not specified',
              location: job.location || 'Location not specified',
              type: job.type || 'Not specified',
              salary: job.salary || 'Not specified',
              description: job.description || 'No description available',
              requirements: job.requirements ? 
                (typeof job.requirements === 'string' ? 
                  job.requirements.split(',').map((r: string) => r.trim()) : 
                  Array.isArray(job.requirements) ? job.requirements : []) : 
                [],
              postedDate: job.postedDate || new Date().toISOString()
            },
            shortlistedDate: job.shortlistedDate || new Date().toISOString(),
            status: job.status || 'applied',
            matchScore: Math.floor(Math.random() * 30) + 70 // Random match score between 70-100
          }));
          
          setShortlistedJobs(jobs);
        }
      } catch (err) {
        console.error('Error fetching shortlisted jobs:', err);
        // Fallback to mock data if API fails
        setShortlistedJobs([
          {
            id: '1',
            job: {
              _id: '1',
              title: 'Senior Frontend Developer',
              company: 'TechCorp',
              location: 'San Francisco, CA',
              type: 'Full-time',
              salary: '$120,000 - $150,000',
              description: 'We are looking for an experienced Frontend Developer to join our team.',
              requirements: ['5+ years of React experience', 'TypeScript', 'Redux'],
              postedDate: '2025-07-20T10:30:00Z'
            },
            shortlistedDate: '2025-07-25T10:30:00Z',
            status: 'applied',
            matchScore: 95
          },
          {
            id: '2',
            job: {
              _id: '2',
              title: 'Backend Engineer',
              company: 'DataSystems',
              location: 'New York, NY',
              type: 'Full-time',
              salary: '$130,000 - $160,000',
              description: 'Join our backend team to build scalable systems.',
              requirements: ['Node.js', 'Python', 'AWS', 'Docker'],
              postedDate: '2025-07-15T09:45:00Z'
            },
            shortlistedDate: '2025-07-20T14:15:00Z',
            status: 'interview',
            matchScore: 92
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShortlistedJobs();
  }, []);

  const removeFromShortlist = async (jobId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_BASE_URL}/jobs/shortlisted/${jobId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Update local state
      setShortlistedJobs(shortlistedJobs.filter(job => job.id !== jobId));
    } catch (err) {
      console.error('Error removing from shortlist:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Applied</Badge>;
      case 'interview':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Interview</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const filteredJobs = shortlistedJobs.filter(job => {
    const matchesSearch = job.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        job.job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesType = typeFilter === 'all' || job.job.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shortlisted Jobs</h1>
          <p className="mt-2 text-muted-foreground">Your saved and shortlisted job opportunities</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-1/3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shortlisted jobs..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2 opacity-50" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2 opacity-50" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  className="h-10 px-3"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-8 text-center">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No shortlisted jobs found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Shortlist jobs to see them here'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredJobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium">{job.job.title}</h3>
                        {getStatusBadge(job.status)}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4 mr-1.5" />
                        {job.job.company}
                        <span className="mx-2">•</span>
                        <MapPin className="h-4 w-4 mr-1.5" />
                        {job.job.location}
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mr-1.5" />
                        {job.job.type}
                        <span className="mx-2">•</span>
                        <DollarSign className="h-4 w-4 mr-1.5" />
                        {job.job.salary}
                      </div>
                      <div className="mt-3 flex items-center text-sm text-muted-foreground">
                        <span>Match: </span>
                        <div className="w-16 ml-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              job.matchScore > 85 ? 'bg-green-500' : 
                              job.matchScore > 70 ? 'bg-blue-500' : 'bg-yellow-500'
                            )}
                            style={{ width: `${job.matchScore}%` }}
                          />
                        </div>
                        <span className="ml-2 font-medium">{job.matchScore}%</span>
                        <span className="mx-2">•</span>
                        <span>Shortlisted on: {formatDate(job.shortlistedDate)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeFromShortlist(job.id)}
                      >
                        Remove
                      </Button>
                      <Button size="sm" className="gap-2">
                        View Details
                      </Button>
                    </div>
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

export default ShortlistedJobs;
