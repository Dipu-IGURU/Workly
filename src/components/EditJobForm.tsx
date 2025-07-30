import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Loader2 } from 'lucide-react';

interface JobData {
  _id: string;
  title: string;
  type: string;
  workType: string;
  location: string;
  vacancies: string;
  company: string;
  companyWebsite: string;
  companyDescription: string;
  description: string;
  responsibilities: string;
  requiredSkills: string;
  preferredQualifications: string;
  experience: string;
  education: string;
  salaryRange: string;
  benefits: string;
  applicationDeadline: string;
  startDate: string;
  workHours: string;
  howToApply: string;
  contactEmail: string;
}

export function EditJobForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState<JobData>({
    _id: '',
    title: '',
    type: 'Full-time',
    workType: 'On-site',
    location: '',
    vacancies: '',
    company: '',
    companyWebsite: '',
    companyDescription: '',
    description: '',
    responsibilities: '',
    requiredSkills: '',
    preferredQualifications: '',
    experience: '',
    education: '',
    salaryRange: '',
    benefits: '',
    applicationDeadline: '',
    startDate: '',
    workHours: '',
    howToApply: '',
    contactEmail: ''
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5001/api/jobs/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch job');
        }
        
        const data = await response.json();
        setFormData(data.data);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast({
          title: 'Error',
          description: 'Failed to load job details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/jobs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update job');
      }
      
      toast({
        title: 'Success',
        description: 'Job updated successfully!',
      });
      
      navigate(`/jobs/${id}`);
    } catch (error: any) {
      console.error('Error updating job:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update job',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Edit Job Posting</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Job Type *</Label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workType">Work Type *</Label>
              <select
                id="workType"
                name="workType"
                value={formData.workType}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vacancies">Number of Vacancies</Label>
              <Input
                id="vacancies"
                name="vacancies"
                type="number"
                value={formData.vacancies}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>
        </div>
        
        {/* Company Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Company Information</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Company Website</Label>
              <Input
                id="companyWebsite"
                name="companyWebsite"
                type="url"
                value={formData.companyWebsite}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companyDescription">Company Description</Label>
              <Textarea
                id="companyDescription"
                name="companyDescription"
                value={formData.companyDescription}
                onChange={handleChange}
                rows={3}
                placeholder="Tell us about your company..."
              />
            </div>
          </div>
        </div>
        
        {/* Job Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Job Details</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                placeholder="Provide a detailed description of the job..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="responsibilities">Key Responsibilities *</Label>
              <Textarea
                id="responsibilities"
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                rows={4}
                required
                placeholder="List the key responsibilities of the role..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requiredSkills">Required Skills *</Label>
              <Textarea
                id="requiredSkills"
                name="requiredSkills"
                value={formData.requiredSkills}
                onChange={handleChange}
                rows={3}
                required
                placeholder="List the required skills (comma-separated)..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preferredQualifications">Preferred Qualifications</Label>
              <Textarea
                id="preferredQualifications"
                name="preferredQualifications"
                value={formData.preferredQualifications}
                onChange={handleChange}
                rows={3}
                placeholder="List any preferred qualifications (comma-separated)..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Experience Required *</Label>
                <Input
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 3+ years"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="education">Education Level *</Label>
                <Input
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Bachelor's degree"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salaryRange">Salary Range *</Label>
                <Input
                  id="salaryRange"
                  name="salaryRange"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  required
                  placeholder="e.g., $50,000 - $70,000 per year"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workHours">Work Hours *</Label>
                <Input
                  id="workHours"
                  name="workHours"
                  value={formData.workHours}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 9:00 AM - 5:00 PM, Monday to Friday"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">Application Deadline *</Label>
                <Input
                  id="applicationDeadline"
                  name="applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline?.split('T')[0]}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startDate">Expected Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate?.split('T')[0] || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits</Label>
              <Textarea
                id="benefits"
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows={2}
                placeholder="List any benefits (comma-separated)..."
              />
            </div>
          </div>
        </div>
        
        {/* Application Process */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Application Process</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="howToApply">How to Apply *</Label>
              <Textarea
                id="howToApply"
                name="howToApply"
                value={formData.howToApply}
                onChange={handleChange}
                rows={3}
                required
                placeholder="Provide instructions on how to apply..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange}
                required
                placeholder="hr@example.com"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
