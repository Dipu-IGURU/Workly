import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/firebase";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, User, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState<"user" | "recruiter">("user");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();

      if (data.success && data.user && data.token) {
        console.log('Login successful, received data:', data);
        
        // Check if user role matches selected role
        console.log('User role:', data.user.role, 'Selected role:', userRole);
        if (data.user.role !== userRole) {
          toast({
            title: "Role Mismatch",
            description: `This account is registered as a ${data.user.role}, not a ${userRole}.`,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Use AuthContext login function
        login(data.token, data.user);

        // Show success message
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.user.firstName}!`,
        });

        // Navigate based on role
        if (data.user.role === 'user') {
          console.log('Redirecting to /user-dashboard');
          navigate('/user-dashboard');
        } else {
          console.log('Redirecting to /recruiter-dashboard');
          navigate('/recruiter-dashboard');
        }
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your Can Hiring account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={userRole} onValueChange={(value) => setUserRole(value as "user" | "recruiter")} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                User
              </TabsTrigger>
              <TabsTrigger value="recruiter" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Recruiter
              </TabsTrigger>
            </TabsList>
            <TabsContent value="user" className="mt-4">
              <p className="text-sm text-muted-foreground text-center">
                Looking for your next opportunity? Sign in as a job seeker.
              </p>
            </TabsContent>
            <TabsContent value="recruiter" className="mt-4">
              <p className="text-sm text-muted-foreground text-center">
                Ready to find top talent? Sign in as a recruiter.
              </p>
            </TabsContent>
          </Tabs>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing In..." : `Sign In as ${userRole === "user" ? "Job Seeker" : "Recruiter"}`}
            </Button>
          </form>

          {/* Google Sign-In Button */}
          <Button
            type="button"
            className="w-full mt-2 flex items-center justify-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-100"
            onClick={async () => {
              setLoading(true);
              try {
                const result = await signInWithPopup(auth, provider);
                const user = result.user;

                // Send user info to backend for registration/login
                const response = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: user.email,
                    name: user.displayName,
                    photoURL: user.photoURL,
                    role: userRole, // Send the selected role to the backend
                  }),
                });

                const data = await response.json();
                if (response.ok && data.success && data.token && data.user) {
                  // Use AuthContext login function
                  login(data.token, data.user);

                  toast({
                    title: 'Google Sign-In Successful',
                    description: `Welcome, ${data.user.firstName || data.user.name || data.user.email}!`,
                  });

                  // Navigate based on user role
                  if (data.user.role === 'recruiter') {
                    navigate('/recruiter-dashboard');
                  } else {
                    navigate('/user-dashboard');
                  }
                } else {
                  toast({
                    title: 'Google Sign-In Failed',
                    description: data.message || 'Unable to log in with Google.',
                    variant: 'destructive',
                  });
                }
              } catch (error: any) {
                toast({
                  title: 'Google Sign-In Failed',
                  description: error.message || 'An error occurred during Google authentication.',
                  variant: 'destructive',
                });
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
            {loading ? "Signing in with Google..." : "Sign in with Google"}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
