import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import JobCategories from "@/components/JobCategories";
import FeaturedJobs from "@/components/FeaturedJobs";
import FeaturedCompanies from "@/components/FeaturedCompanies";
import Stats from "@/components/Stats";
import Footer from "@/components/Footer";
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <JobCategories />
      <FeaturedJobs />
      <FeaturedCompanies />
      <Stats />
      <Footer />
    </div>
  );
};

export default Index;
