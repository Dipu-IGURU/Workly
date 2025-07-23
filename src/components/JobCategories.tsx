import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  TrendingUp, 
  Palette, 
  Code, 
  Users, 
  Car, 
  Headphones, 
  Heart,
  Briefcase
} from "lucide-react";

const categories = [
  {
    title: "Accounting / Finance",
    positions: 2,
    icon: Calculator,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
  },
  {
    title: "Marketing",
    positions: 86,
    icon: TrendingUp,
    color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
  },
  {
    title: "Design",
    positions: 43,
    icon: Palette,
    color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
  },
  {
    title: "Development",
    positions: 12,
    icon: Code,
    color: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
  },
  {
    title: "Human Resource",
    positions: 55,
    icon: Users,
    color: "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400"
  },
  {
    title: "Automotive Jobs",
    positions: 2,
    icon: Car,
    color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
  },
  {
    title: "Customer Service",
    positions: 2,
    icon: Headphones,
    color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
  },
  {
    title: "Health and Care",
    positions: 25,
    icon: Heart,
    color: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
  },
  {
    title: "Project Management",
    positions: 92,
    icon: Briefcase,
    color: "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400"
  }
];

const JobCategories = () => {
  return (
    <section className="py-16 bg-category-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Popular Job Categories
          </h2>
          <p className="text-lg text-muted-foreground">
            2020 jobs live - 293 added today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card key={category.title} className="hover:shadow-lg transition-shadow cursor-pointer border border-border bg-job-card">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${category.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {category.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ({category.positions} open position{category.positions !== 1 ? 's' : ''})
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default JobCategories;