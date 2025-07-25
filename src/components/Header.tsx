import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Menu, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const Header = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    return user.role === 'recruiter' ? '/recruiter-dashboard' : '/user-dashboard';
  };
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">W</span>
              </div>
              <span className="ml-2 text-xl font-bold text-foreground">Workly</span>
            </Link>
          </div>

          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
                  <Link to="/" className="flex items-center space-x-1">
                    <span>Home</span>
                    <ChevronDown className="w-4 h-4" />
                  </Link>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Home Default</DropdownMenuItem>
                  <DropdownMenuItem>Home Alternative</DropdownMenuItem>
                  <DropdownMenuItem>Home Creative</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
                  <span>Find Jobs</span>
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Job List</DropdownMenuItem>
                  <DropdownMenuItem>Job Grid</DropdownMenuItem>
                  <DropdownMenuItem>Job Details</DropdownMenuItem>
                  <DropdownMenuItem>Advanced Search</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
                  <span>Employers</span>
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Browse Employers</DropdownMenuItem>
                  <DropdownMenuItem>Employer Dashboard</DropdownMenuItem>
                  <DropdownMenuItem>Submit Job</DropdownMenuItem>
                  <DropdownMenuItem>Employer Profile</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
                  <span>Candidates</span>
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Browse Candidates</DropdownMenuItem>
                  <DropdownMenuItem>Candidate Dashboard</DropdownMenuItem>
                  <DropdownMenuItem>Candidate Profile</DropdownMenuItem>
                  <DropdownMenuItem>Submit Resume</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
                  <span>Blog</span>
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Blog List</DropdownMenuItem>
                  <DropdownMenuItem>Blog Grid</DropdownMenuItem>
                  <DropdownMenuItem>Blog Details</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
                  <span>Pages</span>
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>About Us</DropdownMenuItem>
                  <DropdownMenuItem>Contact</DropdownMenuItem>
                  <DropdownMenuItem>FAQ</DropdownMenuItem>
                  <DropdownMenuItem>Terms & Conditions</DropdownMenuItem>
                  <DropdownMenuItem>Privacy Policy</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-3">
              <Button variant="outline" className="hidden lg:inline-flex text-sm">
                Upload your CV
              </Button>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{user.firstName} {user.lastName}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={getDashboardLink()} className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="sm" className="text-sm">
                    Login / Register
                  </Button>
                </Link>
              )}
              
              {user?.role === 'recruiter' ? (
                <Link to="/recruiter-dashboard">
                  <Button size="sm" className="text-sm">
                    Post Job
                  </Button>
                </Link>
              ) : (
                <Button size="sm" className="text-sm">
                  Job Post
                </Button>
              )}
            </div>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <nav className="flex flex-col h-full">
                  <div className="flex items-center mb-6 pb-4 border-b border-border">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">W</span>
                    </div>
                    <span className="ml-2 text-lg font-bold text-foreground">Workly</span>
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="flex-1 space-y-4 overflow-y-auto">
                    <div className="pb-2">
                      <h3 className="font-semibold text-foreground mb-3 text-base">Home</h3>
                      <div className="space-y-3 pl-3">
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Home Default</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Home Alternative</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Home Creative</p>
                      </div>
                    </div>

                    <div className="pb-2">
                      <h3 className="font-semibold text-foreground mb-3 text-base">Find Jobs</h3>
                      <div className="space-y-3 pl-3">
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Job List</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Job Grid</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Job Details</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Advanced Search</p>
                      </div>
                    </div>

                    <div className="pb-2">
                      <h3 className="font-semibold text-foreground mb-3 text-base">Employers</h3>
                      <div className="space-y-3 pl-3">
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Browse Employers</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Employer Dashboard</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Submit Job</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Employer Profile</p>
                      </div>
                    </div>

                    <div className="pb-2">
                      <h3 className="font-semibold text-foreground mb-3 text-base">Candidates</h3>
                      <div className="space-y-3 pl-3">
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Browse Candidates</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Candidate Dashboard</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Candidate Profile</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Submit Resume</p>
                      </div>
                    </div>

                    <div className="pb-2">
                      <h3 className="font-semibold text-foreground mb-3 text-base">Blog</h3>
                      <div className="space-y-3 pl-3">
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Blog List</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Blog Grid</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Blog Details</p>
                      </div>
                    </div>

                    <div className="pb-2">
                      <h3 className="font-semibold text-foreground mb-3 text-base">Pages</h3>
                      <div className="space-y-3 pl-3">
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">About Us</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Contact</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">FAQ</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Terms & Conditions</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1">Privacy Policy</p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="mt-auto pt-6 border-t border-border space-y-3 flex-shrink-0">
                    <Button variant="outline" className="w-full h-11 text-sm">
                      Upload your CV
                    </Button>
                    {user ? (
                      <>
                        <Link to={getDashboardLink()}>
                          <Button variant="outline" className="w-full h-11 text-sm">
                            Dashboard
                          </Button>
                        </Link>
                        <Button onClick={handleLogout} variant="destructive" className="w-full h-11 text-sm">
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Link to="/login">
                        <Button variant="outline" className="w-full h-11 text-sm">
                          Login / Register
                        </Button>
                      </Link>
                    )}
                    <Button className="w-full h-11 text-sm">
                      Job Post
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;