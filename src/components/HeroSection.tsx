import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import heroManImage from "@/assets/hero-man.png";

const HeroSection = () => {
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
              Find Jobs, Employment & Career Opportunities
            </p>

            <div className="bg-background rounded-lg p-4 shadow-lg border border-border">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Job title, keywords, or company"
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="City or postcode"
                    className="pl-10"
                  />
                </div>
                <Button className="w-full">
                  Find Jobs
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Popular Searches:</p>
              <div className="flex flex-wrap gap-2">
                {["Designer", "Developer", "Web", "IOS", "PHP", "Senior", "Engineer"].map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
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