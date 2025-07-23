import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, X, User, MapPin, CheckCircle, Briefcase } from "lucide-react";
import { useUser } from "@/hooks/use-user";

export default function Resume() {
  // Get user data from context or props
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">My Resume</h1>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Resume Preview</CardTitle>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              View Full Resume
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Resume Preview */}
            <div className="md:col-span-2 border rounded-lg p-6 bg-gray-50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-gray-600">{user?.title || 'Professional Title'}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    {user?.location || 'Location not specified'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 border-b pb-1 mb-2">Summary</h4>
                  <p className="text-sm text-gray-600">
                    Experienced professional with a strong background in the field. Skilled in various technologies and methodologies.
                    Passionate about creating efficient and innovative solutions.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 border-b pb-1 mb-2">Experience</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium">Senior UI/UX Designer</h5>
                      <p className="text-sm text-gray-600">Tech Company Inc. • 2020 - Present</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Led design initiatives and collaborated with cross-functional teams to deliver exceptional user experiences.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium">UI Designer</h5>
                      <p className="text-sm text-gray-600">Digital Agency • 2018 - 2020</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Designed and implemented user interfaces for various clients across different industries.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 border-b pb-1 mb-2">Education</h4>
                  <div>
                    <h5 className="font-medium">Master of Design</h5>
                    <p className="text-sm text-gray-600">University of Design • 2016 - 2018</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 border-b pb-1 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {['UI/UX Design', 'Figma', 'User Research', 'Prototyping', 'HTML/CSS', 'JavaScript', 'React', 'Responsive Design'].map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm font-normal">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Resume Actions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Resume Status</h4>
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Your resume is complete and visible to employers</span>
                </div>
                <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <h4 className="font-medium text-gray-900">Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Update Resume
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                    <X className="mr-2 h-4 w-4" />
                    Hide from Employers
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Resume Strength</h4>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{width: '85%'}}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">85% complete - Almost there!</p>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Contact Information
                  </p>
                  <p className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Work Experience
                  </p>
                  <p className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Education
                  </p>
                  <p className="flex items-center">
                    <Briefcase className="h-4 w-4 text-gray-300 mr-2" />
                    Skills (3+ recommended)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
