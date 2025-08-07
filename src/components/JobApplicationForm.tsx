import { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { API_BASE_URL } from "@/lib/config";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { X } from 'lucide-react';

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function JobApplicationForm({
  jobId,
  jobTitle,
  companyName,
  open,
  onOpenChange,
  onSuccess,
}: JobApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentLocation: '',
    experience: '',
    education: '',
    currentCompany: '',
    currentPosition: '',
    expectedSalary: '',
    noticePeriod: '',
    resume: null as File | null,
    coverLetter: '',
    portfolio: '',
    linkedinProfile: '',
  });
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        resume: e.target.files![0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('currentLocation', formData.currentLocation);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('education', formData.education);
      formDataToSend.append('currentCompany', formData.currentCompany);
      formDataToSend.append('currentPosition', formData.currentPosition);
      formDataToSend.append('expectedSalary', formData.expectedSalary);
      formDataToSend.append('noticePeriod', formData.noticePeriod);
      formDataToSend.append('coverLetter', formData.coverLetter);
      formDataToSend.append('portfolio', formData.portfolio);
      formDataToSend.append('linkedinProfile', formData.linkedinProfile);
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume);
      }

      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application');
      }

      toast({
        title: 'Application Submitted',
        description: 'Your application has been submitted successfully!',
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit application',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Submit your application for the {jobTitle} position at {companyName}.
          </DialogDescription>
        </DialogHeader>
        <form id="application-form" onSubmit={handleSubmit} className="space-y-6 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentLocation">Current Location *</Label>
                <Input
                  id="currentLocation"
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={handleChange}
                  placeholder="City, State/Country"
                  required
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Professional Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentCompany">Current Company</Label>
                <Input
                  id="currentCompany"
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleChange}
                  placeholder="Your current company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentPosition">Current Position</Label>
                <Input
                  id="currentPosition"
                  name="currentPosition"
                  value={formData.currentPosition}
                  onChange={handleChange}
                  placeholder="Your current job title"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience *</Label>
                <Input
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 3-5 years"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education">Highest Education *</Label>
                <Input
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  placeholder="e.g., Bachelor's in Computer Science"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedSalary">Expected Salary</Label>
                <Input
                  id="expectedSalary"
                  name="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={handleChange}
                  placeholder="e.g., $60,000 - $80,000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="noticePeriod">Notice Period</Label>
                <Input
                  id="noticePeriod"
                  name="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={handleChange}
                  placeholder="e.g., 2 weeks, 1 month"
                />
              </div>
            </div>
          </div>

          {/* Online Profiles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Online Profiles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                <Input
                  id="linkedinProfile"
                  name="linkedinProfile"
                  value={formData.linkedinProfile}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio/Website</Label>
                <Input
                  id="portfolio"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Documents</h3>
            <div className="space-y-2">
              <Label htmlFor="resume">Resume/CV (PDF, DOC, DOCX) *</Label>
              <Input
                id="resume"
                name="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                required
              />
              <p className="text-sm text-gray-500">Upload your latest resume or CV</p>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Cover Letter</h3>
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Why should we hire you?</Label>
              <Textarea
                id="coverLetter"
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                rows={6}
                placeholder="Tell us why you're the perfect fit for this position. Include your relevant experience, skills, and what excites you about this role..."
              />
              <p className="text-sm text-gray-500">This is your chance to make a great first impression!</p>
            </div>
          </div>
        </form>
        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="application-form" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
