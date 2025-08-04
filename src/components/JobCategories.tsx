
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
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

// Data will be fetched from API

interface Category {
  title: string;
  positions: number;
}

const iconMap: Record<string, React.ElementType> = {
  "Accounting / Finance": Calculator,
  Marketing: TrendingUp,
  Design: Palette,
  Development: Code,
  "Human Resource": Users,
  "Automotive Jobs": Car,
  "Customer Service": Headphones,
  "Health and Care": Heart,
  "Project Management": Briefcase,
};

const colorMap: Record<string, string> = {
  "Accounting / Finance": "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  Marketing: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
  Design: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  Development: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  "Human Resource": "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
  "Automotive Jobs": "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
  "Customer Service": "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
  "Health and Care": "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  "Project Management": "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400",
};





// Fallback categories shown when API returns no data or errors out
const fallbackCategories: Category[] = [
  { title: "Development", positions: 120 },
  { title: "Design", positions: 45 },
  { title: "Human Resource", positions: 25 },
  { title: "Marketing", positions: 60 },
  { title: "Accounting / Finance", positions: 30 },
];

const JobCategories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/jobs/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const filtered = (data.data as Category[]).filter(c => c.title && c.positions > 0);
          setCategories(filtered.length ? filtered : fallbackCategories);
        } else {
          setError("Failed to load categories");
        }
      })
      .catch((err) => {
        console.error(err);
        setCategories(fallbackCategories);
        setError("Failed to load categories");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-category-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Popular Job Categories
          </h2>
          <p className="text-lg text-muted-foreground">
            {categories.length} jobs live - {categories.length} added today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && <p className="text-center col-span-full">Loading...</p>}
          {error && <p className="text-center col-span-full text-red-500">{error}</p>}
          {!loading && !error && categories.length === 0 && (
            <p className="text-center col-span-full">No categories to show yet.</p>
          )}
          {!loading && !error && categories.map((category) => {
            const IconComponent = iconMap[category.title] ?? Briefcase;
            const color = colorMap[category.title] ?? "bg-gray-100 text-gray-600 dark:bg-gray-800/20 dark:text-gray-400";
            return (
              <Card
                key={category.title}
                onClick={() => navigate(`/jobs?category=${encodeURIComponent(category.title)}`)}
                className="hover:shadow-lg transition-shadow cursor-pointer border border-border bg-job-card">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
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