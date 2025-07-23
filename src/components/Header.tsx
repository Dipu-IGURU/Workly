import { Button } from "@/components/ui/button";
import { Search, ChevronDown } from "lucide-react";

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
              <span className="ml-2 text-xl font-bold text-foreground">Superio</span>
            </div>
          </div>

          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <div className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
                <span>Home</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
                <span>Find Jobs</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
                <span>Employers</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
                <span>Candidates</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
                <span>Blog</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-1 text-foreground hover:text-primary cursor-pointer">
                <span>Pages</span>
                <ChevronDown className="w-4 h-4" />
              </div>
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