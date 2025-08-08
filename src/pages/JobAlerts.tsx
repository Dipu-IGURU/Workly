import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Briefcase, Bell, BellOff, Search, Filter, X } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface JobAlert {
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
  };
  status: 'active' | 'inactive';
  lastNotified: string;
  matchScore: number;
}

const JobAlerts: React.FC = () => {
  const [jobAlerts, setJobAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    const fetchJobAlerts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/jobs/public`, {
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
          // Transform the API response to match our JobAlert interface
          const alerts = data.data.map((job: any) => ({
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
                []
            },
            status: 'active', // Default status
            lastNotified: new Date().toISOString(),
            matchScore: Math.floor(Math.random() * 30) + 70 // Random match score between 70-100
          }));
          
          setJobAlerts(alerts);
        }
      } catch (err) {
        console.error('Error fetching job alerts:', err);
        // Fallback to mock data if API fails
        setJobAlerts([
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
              requirements: ['5+ years of React experience', 'TypeScript', 'Redux']
            },
            status: 'active',
            lastNotified: '2025-07-25T10:30:00Z',
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
              requirements: ['Node.js', 'Python', 'AWS', 'Docker']
            },
            status: 'inactive',
            lastNotified: '2025-07-20T09:45:00Z',
            matchScore: 92
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobAlerts();
  }, []);

  const toggleAlertStatus = (id: string) => {
    setJobAlerts(jobAlerts.map(alert => 
      alert.id === id 
        ? { ...alert, status: alert.status === 'active' ? 'inactive' : 'active' as const }
        : alert
    ));
  };

  const filteredAlerts = jobAlerts.filter(alert => {
    const matchesSearch = alert.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesType = typeFilter === 'all' || alert.job.type === typeFilter;
    
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
          <h1 className="text-3xl font-bold tracking-tight">Job Alerts</h1>
          <p className="mt-2 text-muted-foreground">Manage your job alerts and get notified about new opportunities</p>
        </div>
        <Button className="mt-4 sm:mt-0">
          <Bell className="w-4 h-4 mr-2" /> Create New Alert
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-1/3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
          ) : filteredAlerts.length === 0 ? (
            <div className="p-8 text-center">
              <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">No job alerts found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create a new job alert to get started'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredAlerts.map((alert) => (
                <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-medium">{alert.job.title}</h3>
                          <p className="text-sm text-muted-foreground">{alert.job.company}</p>
                        </div>
                        <Badge 
                          variant={alert.status === 'active' ? 'default' : 'secondary'}
                          className="ml-4 whitespace-nowrap"
                        >
                          {alert.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{alert.job.location}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{alert.job.type}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                alert.matchScore > 80 ? 'bg-green-500' : 
                                alert.matchScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} 
                              style={{ width: `${alert.matchScore}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-700">
                            {alert.matchScore}% match
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {alert.job.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {alert.job.requirements.slice(0, 3).map((req, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {alert.job.requirements.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{alert.job.requirements.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 text-xs text-muted-foreground">
                        Last notified: {formatDate(alert.lastNotified)}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-4 sm:mt-0">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        View Details
                      </Button>
                      <Button 
                        variant={alert.status === 'active' ? 'outline' : 'default'} 
                        size="sm" 
                        className="w-full sm:w-auto"
                        onClick={() => toggleAlertStatus(alert.id)}
                      >
                        {alert.status === 'active' ? (
                          <>
                            <BellOff className="h-4 w-4 mr-2" />
                            Turn Off
                          </>
                        ) : (
                          <>
                            <Bell className="h-4 w-4 mr-2" />
                            Turn On
                          </>
                        )}
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

export default JobAlerts;
