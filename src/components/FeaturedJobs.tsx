import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign, Bookmark } from "lucide-react";

const jobs = [
  {
    id: 1,
    title: "Software Engineer (Android), Libraries",
    company: "Segment",
    location: "London, UK",
    type: "Freelance",
    salary: "$35k - $45k",
    tags: ["App", "Digital"],
    logo: "S",
    urgent: false,
    featured: true,
    postedTime: "3 min ago"
  },
  {
    id: 2,
    title: "Recruiting Coordinator",
    company: "Catalyst",
    location: "London, UK",
    type: "Part Time",
    salary: "$35k - $45k",
    tags: ["Design", "Art"],
    logo: "C",
    urgent: true,
    featured: false,
    postedTime: "3 min ago"
  },
  {
    id: 3,
    title: "Product Manager, Studio",
    company: "Invision",
    location: "London, UK",
    type: "Full Time",
    salary: "$35k - $45k",
    tags: ["Design", "Art"],
    logo: "I",
    urgent: false,
    featured: true,
    postedTime: "3 min ago"
  },
  {
    id: 4,
    title: "Senior Product Designer",
    company: "Upwork",
    location: "London, UK",
    type: "Full Time",
    salary: "$35k - $45k",
    tags: ["Design", "Art"],
    logo: "U",
    urgent: false,
    featured: false,
    postedTime: "3 min ago"
  },
  {
    id: 5,
    title: "Senior Full Stack Engineer, Creator Success",
    company: "Medium",
    location: "London, UK",
    type: "Full Time",
    salary: "$35k - $45k",
    tags: ["Design", "Art"],
    logo: "M",
    urgent: false,
    featured: true,
    postedTime: "3 min ago"
  },
  {
    id: 6,
    title: "Software Engineer, ML Platform",
    company: "Figma",
    location: "London, UK",
    type: "Full Time",
    salary: "$35k - $45k",
    tags: ["App", "Digital"],
    logo: "F",
    urgent: false,
    featured: false,
    postedTime: "3 min ago"
  }
];

const FeaturedJobs = () => {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Featured Jobs
          </h2>
          <p className="text-lg text-muted-foreground">
            Know your worth and find the job that qualify your life
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow border border-border bg-job-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-lg">
                        {job.logo}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg mb-1">
                        {job.title}
                      </h3>
                      <p className="text-muted-foreground">{job.company}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                  {job.urgent && (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                      Urgent
                    </Badge>
                  )}
                  {job.featured && (
                    <Badge className="bg-badge-blue text-white">
                      Featured
                    </Badge>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{job.postedTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.salary}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                    {job.type}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Listings
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedJobs;