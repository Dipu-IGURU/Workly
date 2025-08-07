import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useJobs } from "@/contexts/JobsContext";

export interface JobPostData {
  // Basic Job Information
  title: string;
  type: string;
  workType: string;
  location: string;
  category: string;
  vacancies?: string;
  
  // Company Information
  company: string;
  companyWebsite?: string;
  companyDescription?: string;
  
  // Job Description
  description: string;
  responsibilities: string;
  requiredSkills: string;
  preferredQualifications?: string;
  experience: string;
  education?: string;
  
  // Compensation & Benefits
  salaryRange: string;
  benefits?: string;
  
  // Other Details
  applicationDeadline: string;
  startDate?: string;
  workHours: string;
  
  // Application Process
  howToApply: string;
  contactEmail: string;
}

interface JobPostFormProps {
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function JobPostForm({ onSuccess, children }: JobPostFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<JobPostData>({
    // Basic Job Information
    title: '',
    type: 'Full-time',  // Must be one of: 'Full-time', 'Part-time', 'Contract', 'Remote'
    workType: 'On-site',
    location: '',
    category: '',
    vacancies: '',
    
    // Company Information
    company: '',
    companyWebsite: '',
    companyDescription: '',
    
    // Job Description
    description: '',
    responsibilities: '',
    requiredSkills: '',
    preferredQualifications: '',
    experience: '',
    education: '',
    
    // Compensation & Benefits
    salaryRange: '',
    benefits: '',
    
    // Other Details
    applicationDeadline: new Date().toISOString().split('T')[0], // Set default to today
    startDate: '',
    workHours: 'Full-time',
    
    // Application Process
    howToApply: '',
    contactEmail: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { refreshJobs } = useJobs();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    // Check required fields
    const requiredFields = [
      { field: 'title', name: 'Job Title' },
      { field: 'company', name: 'Company Name' },
      { field: 'location', name: 'Location' },
    { field: 'category', name: 'Category' },
      { field: 'type', name: 'Job Type' },
      { field: 'description', name: 'Job Description' },
      { field: 'responsibilities', name: 'Job Responsibilities' },
      { field: 'requiredSkills', name: 'Required Skills' }
    ];

    const missingFields = requiredFields
      .map(({ field, name }) => (!formData[field]?.trim() ? name : null))
      .filter(Boolean);

    if (missingFields.length > 0) {
      toast({
        title: 'Missing Required Fields',
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: 'destructive'
      });
      return false;
    }

    // Validate email format if provided
    if (formData.contactEmail && !/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address for the contact email',
        variant: 'destructive'
      });
      return false;
    }
    
    // Validate date format if provided
    if (formData.applicationDeadline) {
      const deadlineDate = new Date(formData.applicationDeadline);
      if (isNaN(deadlineDate.getTime())) {
        toast({
          title: 'Invalid Date',
          description: 'Please enter a valid application deadline date',
          variant: 'destructive'
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // Prepare the data for API with required fields that match the server model
      const jobData = {
        // Basic Job Information
        title: formData.title.trim(),
        category: formData.category.trim(),
        type: formData.type,
        workType: formData.workType,
        location: formData.location.trim(),
        vacancies: formData.vacancies?.trim() || '',
        
        // Company Information
        company: formData.company.trim(),
        companyWebsite: formData.companyWebsite?.trim() || '',
        companyDescription: formData.companyDescription?.trim() || '',
        
        // Job Description
        description: formData.description.trim(),
        responsibilities: formData.responsibilities.trim(),
        requiredSkills: formData.requiredSkills.trim(),
        preferredQualifications: formData.preferredQualifications?.trim() || '',
        experience: formData.experience.trim(),
        education: formData.education?.trim() || '',
        
        // Compensation & Benefits
        salaryRange: formData.salaryRange.trim(),
        benefits: formData.benefits?.trim() || '',
        
        // Other Details
        applicationDeadline: formData.applicationDeadline,
        startDate: formData.startDate?.trim() || '',
        workHours: formData.workHours,
        
        // Application Process
        howToApply: formData.howToApply.trim(),
        contactEmail: formData.contactEmail.trim()
      };

      console.log('Submitting job data:', JSON.stringify(jobData, null, 2));

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API reported failure:', data);
        throw new Error(data.message || 'Failed to post job');
      }

      toast({
        title: "Success!",
        description: data?.message || "Job posted successfully. Redirecting to job details...",
      });
      
      // Close the dialog and reset form
      setOpen(false);
      
      // Redirect to job details page after a short delay
      if (data.data && data.data._id) {
        setTimeout(() => {
          navigate(`/jobs/${data.data._id}`);
        }, 1500);
      }
      
      // Reset form after successful submission
      const resetData: JobPostData = {
        // Basic Job Information
        title: '',
        type: 'Full-time',
        workType: 'On-site',
        location: '',
        category: '',
        vacancies: '',
        
        // Company Information
        company: '',
        companyWebsite: '',
        companyDescription: '',
        
        // Job Description
        description: '',
        responsibilities: '',
        requiredSkills: '',
        preferredQualifications: '',
        experience: '',
        education: '',
        
        // Compensation & Benefits
        salaryRange: '',
        benefits: '',
        
        // Other Details
        applicationDeadline: new Date().toISOString().split('T')[0],
        startDate: '',
        workHours: 'Full-time',
        
        // Application Process
        howToApply: '',
        contactEmail: ''
      };
      
      setFormData(resetData);
      setOpen(false);
      
      refreshJobs(); // Refresh jobs list
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error posting job:', error);
      const errorMessage = error.message || "Failed to post job. Please try again.";
      
      // Check if this is a validation error from the server
      if (error.message && error.message.includes('validation')) {
        toast({
          title: "Validation Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Post New Job</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 📝 Basic Job Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">📝 Basic Job Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior React Developer"
                  
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
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
              <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Engineering" className="mb-4" />

              <Label htmlFor="workType">Work Type *</Label>
                <select
                  id="workType"
                  name="workType"
                  value={formData.workType}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  
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
                  placeholder="e.g. New York, NY or Remote"
                  
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vacancies">Number of Vacancies</Label>
                <Input
                  id="vacancies"
                  name="vacancies"
                  type="number"
                  min="1"
                  value={formData.vacancies}
                  onChange={handleChange}
                  placeholder="e.g. 2"
                />
              </div>
            </div>
          </div>

          {/* 🧑‍💼 Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">🧑‍💼 Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  
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

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="companyDescription">Company Description</Label>
                <Textarea
                  id="companyDescription"
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Short overview of your company..."
                />
              </div>
            </div>
          </div>

          {/* 📋 Job Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">📋 Job Description</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Job Overview *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief overview of the role..."
                  
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">Job Responsibilities / Duties *</Label>
                <Textarea
                  id="responsibilities"
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleChange}
                  rows={4}
                  placeholder="List key responsibilities..."
                  
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requiredSkills">Required Skills / Technologies *</Label>
                <Textarea
                  id="requiredSkills"
                  name="requiredSkills"
                  value={formData.requiredSkills}
                  onChange={handleChange}
                  rows={3}
                  placeholder="List required skills and technologies..."
                  
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredQualifications">Preferred Qualifications</Label>
                <Textarea
                  id="preferredQualifications"
                  name="preferredQualifications"
                  value={formData.preferredQualifications}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Any preferred qualifications..."
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
                    placeholder="e.g., 2-4 years"
                    
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education Level</Label>
                  <Input
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    placeholder="e.g., Bachelor's, Master's"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 💰 Compensation & Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">💰 Compensation & Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryRange">Salary Range *</Label>
                <Input
                  id="salaryRange"
                  name="salaryRange"
                  value={formData.salaryRange}
                  onChange={handleChange}
                  placeholder="e.g., $50k–$70k or Negotiable"
                  
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="benefits">Benefits</Label>
                <Input
                  id="benefits"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  placeholder="e.g., Health insurance, Paid leave"
                />
              </div>
            </div>
          </div>

          {/* ⏱️ Other Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">⏱️ Other Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicationDeadline">Application Deadline *</Label>
                <Input
                  id="applicationDeadline"
                  name="applicationDeadline"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Job Start Date (Optional)</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  min={formData.applicationDeadline || new Date().toISOString().split('T')[0]}
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workHours">Work Hours *</Label>
                <select
                  id="workHours"
                  name="workHours"
                  value={formData.workHours}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Flexible">Flexible</option>
                  <option value="Shift-based">Shift-based</option>
                </select>
              </div>
            </div>
          </div>

          {/* 📬 Application Process */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">📬 Application Process</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="howToApply">How to Apply *</Label>
                <Textarea
                  id="howToApply"
                  name="howToApply"
                  value={formData.howToApply}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Instructions for applicants (e.g., 'Submit resume to...' or 'Apply via our website...')"
                  
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
                  placeholder="recruiter@example.com"
                  
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
