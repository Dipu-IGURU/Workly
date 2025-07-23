import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">W</span>
              </div>
              <span className="ml-2 text-xl font-bold text-foreground">Workly</span>
            </div>
          </div>

          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
                  <span>Home</span>
                  <ChevronDown className="w-4 h-4" />
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
            <div className="hidden sm:flex items-center space-x-4">
              <Button variant="outline" className="hidden lg:inline-flex">
                Upload your CV
              </Button>
              <Button variant="outline" size="sm">
                Login / Register
              </Button>
              <Button size="sm">
                Job Post
              </Button>
            </div>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4">
                  <div className="flex items-center space-y-2 mb-6">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">W</span>
                    </div>
                    <span className="ml-2 text-lg font-bold text-foreground">Workly</span>
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Home</h3>
                      <div className="space-y-2 pl-4">
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Home Default</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Home Alternative</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Home Creative</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Find Jobs</h3>
                      <div className="space-y-2 pl-4">
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Job List</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Job Grid</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Job Details</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Advanced Search</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Employers</h3>
                      <div className="space-y-2 pl-4">
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Browse Employers</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Employer Dashboard</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Submit Job</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Employer Profile</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Candidates</h3>
                      <div className="space-y-2 pl-4">
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Browse Candidates</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Candidate Dashboard</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Candidate Profile</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Submit Resume</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Blog</h3>
                      <div className="space-y-2 pl-4">
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Blog List</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Blog Grid</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Blog Details</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Pages</h3>
                      <div className="space-y-2 pl-4">
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">About Us</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Contact</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">FAQ</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Terms & Conditions</p>
                        <p className="text-sm text-muted-foreground cursor-pointer hover:text-primary">Privacy Policy</p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="space-y-3 pt-6 border-t border-border">
                    <Button variant="outline" className="w-full">
                      Upload your CV
                    </Button>
                    <Button variant="outline" className="w-full">
                      Login / Register
                    </Button>
                    <Button className="w-full">
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