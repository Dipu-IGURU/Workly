import { Button } from "@/components/ui/button";
import { Search, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">S</span>
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

          <div className="flex items-center space-x-4">
            <Button variant="outline" className="hidden sm:inline-flex">
              Upload your CV
            </Button>
            <Button variant="outline">
              Login / Register
            </Button>
            <Button>
              Job Post
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;