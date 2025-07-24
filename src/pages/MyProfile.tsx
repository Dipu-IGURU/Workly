import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// DashboardLayout is now handled by the router

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    website: '',
    currentSalary: '',
    experience: '',
    age: '',
    education: '',
    description: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    country: '',
    city: '',
    address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [isLoading, setIsLoading] = useState(false);

  // Load profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const result = await profileApi.getProfile();
        if (result.success && result.profile) {
          setFormData(prev => ({
            ...prev,
            ...result.profile
          }));
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      // Validate required fields
      if (!formData.fullName || !formData.email) {
        throw new Error('Full name and email are required');
      }
      
      // Ensure email is in lowercase and trimmed
      const updatedFormData = {
        ...formData,
        email: formData.email?.toLowerCase().trim()
      };
      
      const result = await profileApi.updateProfile(updatedFormData);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        // Update the form data with the server response to ensure consistency
        if (result.profile) {
          setFormData(prev => ({
            ...prev,
            ...result.profile
          }));
        }
      } else {
        throw new Error(result.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      // Show more specific error messages based on error type
      if (error.message.includes('NetworkError')) {
        toast.error('Unable to connect to the server. Please check your internet connection.');
      } else if (error.message.includes('401')) {
        toast.error('Session expired. Please log in again.');
        // Optionally redirect to login
        navigate('/login');
      } else {
        toast.error(error.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">My Profile!</h1>
      <p className="text-gray-600 mb-8">Ready to jump back in?</p>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" onClick={() => setActiveTab('profile')}>My Profile</TabsTrigger>
          <TabsTrigger value="social" onClick={() => setActiveTab('social')}>Social Network</TabsTrigger>
          <TabsTrigger value="contact" onClick={() => setActiveTab('contact')}>Contact Information</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                {/* Profile Image Upload */}
                <div className="mb-8">
                  <Label className="block text-sm font-medium mb-2">Profile Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full mb-4 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="text-blue-600 font-medium">Browse Logo</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB (270x270px recommended)
                    </p>
                    <input type="file" className="hidden" id="profile-image" accept="image/*" />
                  </div>
                </div>

                {/* Form Fields - Two Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Column 1 */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName || ''}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="jobTitle">Job Title *</Label>
                      <div className="relative">
                        <Input
                          id="jobTitle"
                          name="jobTitle"
                          value={formData.jobTitle || ''}
                          onChange={handleChange}
                          placeholder="e.g. Designer"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="experience">Experience</Label>
                      <Select 
                        value={formData.experience || ''}
                        onValueChange={(value) => handleSelectChange('experience', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level</SelectItem>
                          <SelectItem value="1-3">1-3 years</SelectItem>
                          <SelectItem value="4-6">4-6 years</SelectItem>
                          <SelectItem value="7-10">7-10 years</SelectItem>
                          <SelectItem value="10+">10+ years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="education">Education Levels</Label>
                      <Select 
                        value={formData.education || ''}
                        onValueChange={(value) => handleSelectChange('education', value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select education level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high-school">High School</SelectItem>
                          <SelectItem value="associate">Associate Degree</SelectItem>
                          <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                          <SelectItem value="master">Master's Degree</SelectItem>
                          <SelectItem value="phd">Ph.D.</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Allow In Search & Listing</Label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="allowSearch"
                            value="yes"
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">Yes</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="allowSearch"
                            value="no"
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">No</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Tell us about yourself..."
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Save Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Network Tab */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Network</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      name="facebook"
                      type="url"
                      value={formData.facebook}
                      onChange={handleChange}
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      type="url"
                      value={formData.twitter}
                      onChange={handleChange}
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      type="url"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Save Social Links
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Information Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select onValueChange={(value) => handleSelectChange('country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                        <SelectItem value="in">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Select onValueChange={(value) => handleSelectChange('city', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new-york">New York</SelectItem>
                        <SelectItem value="london">London</SelectItem>
                        <SelectItem value="toronto">Toronto</SelectItem>
                        <SelectItem value="sydney">Sydney</SelectItem>
                        <SelectItem value="mumbai">Mumbai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mb-6">
                  <Label htmlFor="address">Complete Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your full address"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Save Contact Information
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyProfile;
