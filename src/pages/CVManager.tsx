import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Eye, Download, Plus, FileText, FileUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CVFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  isDefault: boolean;
  url: string;
}

const CVManager = () => {
  const [cvFiles, setCvFiles] = useState<CVFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const { toast } = useToast();

  // Simulate loading CV files from API
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchCVs = async () => {
      try {
        // Mock data - replace with actual API call
        const mockData: CVFile[] = [
          {
            id: '1',
            name: 'My_Resume_2025.pdf',
            size: '2.5 MB',
            uploadDate: '2025-07-20',
            isDefault: true,
            url: '/cvs/My_Resume_2025.pdf'
          },
          {
            id: '2',
            name: 'CV_Designer.pdf',
            size: '1.8 MB',
            uploadDate: '2025-07-15',
            isDefault: false,
            url: '/cvs/CV_Designer.pdf'
          }
        ];
        setCvFiles(mockData);
      } catch (error) {
        console.error('Error fetching CVs:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your CVs. Please try again later.',
          variant: 'destructive'
        });
      }
    };

    fetchCVs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a PDF or Word document.',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 5MB.',
          variant: 'destructive'
        });
        return;
      }
      
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90; // Hold at 90% until complete
          }
          return prev + 10;
        });
      }, 200);

      // In a real app, you would upload the file to your server here
      // const formData = new FormData();
      // formData.append('cv', selectedFile);
      // formData.append('isDefault', isDefault.toString());
      // const response = await fetch('/api/cv/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      clearInterval(interval);
      setUploadProgress(100);

      // Add the new CV to the list
      const newCV: CVFile = {
        id: Date.now().toString(),
        name: selectedFile.name,
        size: (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB',
        uploadDate: new Date().toISOString().split('T')[0],
        isDefault: isDefault,
        url: `/cvs/${selectedFile.name}`
      };

      // If this is set as default, unset any existing default
      const updatedCVs = cvFiles.map(cv => ({
        ...cv,
        isDefault: cv.isDefault ? false : cv.isDefault
      }));

      setCvFiles([...updatedCVs, newCV]);
      
      // Reset form
      setSelectedFile(null);
      setFileName('');
      setIsDefault(false);
      
      toast({
        title: 'Success',
        description: 'CV uploaded successfully!',
      });
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your CV. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setTimeout(() => setUploadProgress(0), 1000);
      setIsUploading(false);
    }
  };

  const handleSetDefault = (id: string) => {
    setCvFiles(cvFiles.map(cv => ({
      ...cv,
      isDefault: cv.id === id
    })));
    
    // In a real app, you would call an API to update the default status
    toast({
      title: 'Default CV updated',
      description: 'Your default CV has been updated.',
    });
  };

  const handleDelete = (id: string) => {
    // In a real app, you would call an API to delete the CV
    setCvFiles(cvFiles.filter(cv => cv.id !== id));
    
    toast({
      title: 'CV deleted',
      description: 'The CV has been removed from your profile.',
    });
  };

  const formatFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? `.${extension}` : '';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CV Manager</h1>
          <p className="text-muted-foreground">Upload and manage your CVs</p>
        </div>
        <Button className="mt-4 md:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          Upload New CV
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Upload Card */}
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle>Upload New CV</CardTitle>
            <CardDescription>
              Upload your CV in PDF or Word format (max 5MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="cv-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 hover:bg-accent/50 transition-colors">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {selectedFile ? fileName : 'Click to browse or drag and drop'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF or Word (max 5MB)
                    </p>
                  </div>
                  <Input
                    id="cv-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </Label>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-4">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {uploadProgress}% uploaded
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="set-default"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  disabled={isUploading}
                />
                <label
                  htmlFor="set-default"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Set as default CV
                </label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
              className="w-full sm:w-auto"
            >
              {isUploading ? 'Uploading...' : 'Upload CV'}
            </Button>
          </CardFooter>
        </Card>

        {/* CV List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your CVs</h2>
          {cvFiles.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No CVs uploaded yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload your first CV to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cvFiles.map((cv) => (
                <Card key={cv.id} className={cv.isDefault ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{cv.name}</h3>
                            {cv.isDefault && (
                              <Badge variant="outline" className="ml-2">
                                Default
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center text-sm text-muted-foreground mt-1 space-x-4">
                            <span>{cv.size}</span>
                            <span>•</span>
                            <span>Uploaded on {cv.uploadDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            // In a real app, this would open the CV in a new tab
                            window.open(cv.url, '_blank');
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            // In a real app, this would download the CV
                            const link = document.createElement('a');
                            link.href = cv.url;
                            link.download = cv.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                        {!cv.isDefault && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleSetDefault(cv.id)}
                          >
                            <FileUp className="h-4 w-4" />
                            <span className="sr-only">Set as default</span>
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive/90"
                          onClick={() => handleDelete(cv.id)}
                          disabled={cv.isDefault}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVManager;
