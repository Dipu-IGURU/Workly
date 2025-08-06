import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import heroManImage from "@/assets/hero-man.png";

const HeroSection = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [showLocations, setShowLocations] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const locationListRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setFilteredLocations(canadianLocations);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationListRef.current && !locationListRef.current.contains(event.target as Node) &&
          locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowLocations(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    
    if (value) {
      const filtered = canadianLocations.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(canadianLocations);
    }
    
    setShowLocations(true);
  };

  const selectLocation = (city: string) => {
    setLocation(city);
    setShowLocations(false);
  };

  // Canadian cities and provinces for suggestions
  const canadianLocations = [
    "Toronto, ON", "Vancouver, BC", "Montreal, QC", "Calgary, AB", "Edmonton, AB",
    "Ottawa, ON", "Mississauga, ON", "Winnipeg, MB", "Quebec City, QC", "Hamilton, ON",
    "Brampton, ON", "Surrey, BC", "Laval, QC", "Halifax, NS", "London, ON",
    "Markham, ON", "Vaughan, ON", "Gatineau, QC", "Saskatoon, SK", "Longueuil, QC",
    "Burnaby, BC", "Regina, SK", "Richmond, BC", "Richmond Hill, ON", "Oakville, ON",
    "Burlington, ON", "Greater Sudbury, ON", "Sherbrooke, QC", "Oshawa, ON", "Saguenay, QC"
  ];

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    if (jobTitle.trim()) {
      searchParams.set('job_title', jobTitle.trim());
    }
    
    if (location.trim()) {
      searchParams.set('location', location.trim());
    }
    
    // Navigate to jobs page with search parameters
    navigate(`/jobs?${searchParams.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePopularSearch = (tag: string) => {
    setJobTitle(tag);
    const searchParams = new URLSearchParams();
    searchParams.set('job_title', tag);
    navigate(`/jobs?${searchParams.toString()}`);
  };

  return (
    <section className="bg-hero-bg py-16 lg:py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight">
              There Are{" "}
              <span className="text-primary">93,178</span>{" "}
              Postings Here<br />
              For you!
            </h1>
            <p className="text-lg text-muted-foreground mt-4 mb-8">
              Find Jobs, Employment & Career Opportunities in Canada
            </p>

            <div className="bg-background rounded-lg p-4 shadow-lg border border-border">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Job title, keywords..."
                    className="pl-10"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div className="relative" ref={locationListRef}>
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
                  <Input
                    ref={locationInputRef}
                    placeholder="City or postcode"
                    className="pl-10 relative z-0"
                    value={location}
                    onChange={handleLocationChange}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setShowLocations(true)}
                  />
                  {showLocations && filteredLocations.length > 0 && (
                    <div className="absolute bottom-full mb-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-[200px] overflow-y-auto z-50">
                      <div className="divide-y divide-gray-100">
                        {filteredLocations.map((city) => (
                          <div
                            key={city}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis"
                            onClick={() => selectLocation(city)}
                            title={city}
                          >
                            {city}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button className="w-full" onClick={handleSearch}>
                  Find Jobs
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Popular Searches:</p>
              <div className="flex flex-wrap gap-2">
                {["Designer", "Developer", "Web", "IOS", "PHP", "Senior", "Engineer"].map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => handlePopularSearch(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative">
              <img
                src={heroManImage}
                alt="Professional man"
                className="w-full h-auto rounded-lg"
              />
              
              {/* Floating notification */}
              <div className="absolute top-8 left-4 bg-background rounded-lg p-3 shadow-lg border border-border">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Work Inquiry From</p>
                    <p className="text-sm text-muted-foreground">Ali Tufan</p>
                  </div>
                </div>
              </div>

              {/* Floating stats */}
              <div className="absolute bottom-8 right-4 bg-background rounded-lg p-4 shadow-lg border border-border">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">10k+</p>
                  <p className="text-sm text-muted-foreground">Candidates</p>
                </div>
              </div>

              {/* Company badge */}
              <div className="absolute top-1/2 right-8 bg-background rounded-lg p-3 shadow-lg border border-border">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-bold">CA</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Creative Agency</p>
                    <p className="text-xs text-muted-foreground">Startup</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;