import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Users, Target, BarChart3, HeartHandshake, Lightbulb, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Expert Team",
      description: "Our team of recruitment experts has years of experience in connecting top talent with leading companies."
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Precision Matching",
      description: "Advanced algorithms ensure the perfect match between candidates and job opportunities."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Data-Driven",
      description: "We use data analytics to optimize your job search and recruitment process."
    },
    {
      icon: <HeartHandshake className="h-8 w-8 text-primary" />,
      title: "Dedicated Support",
      description: "Our support team is always here to help you with any questions or concerns."
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-primary" />,
      title: "Innovative Solutions",
      description: "We're constantly innovating to bring you the best recruitment solutions."
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Global Reach",
      description: "Connect with opportunities and talent from around the world."
    }
  ];

  const stats = [
    { value: "10,000+", label: "Active Jobs" },
    { value: "50,000+", label: "Candidates" },
    { value: "5,000+", label: "Companies" },
    { value: "95%", label: "Success Rate" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4 text-blue-800 bg-blue-100">
            About Workly
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Connecting Talent with Opportunity</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            We're revolutionizing the way companies find talent and candidates find their dream jobs through innovative technology and personalized service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-blue-700">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-600 text-lg">
              To empower individuals and organizations by creating meaningful employment connections that drive success and growth for all.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Why Choose Workly?</h3>
              <ul className="space-y-4">
                {[
                  "Advanced matching algorithms for better job-candidate fit",
                  "User-friendly platform for seamless job searching and hiring",
                  "Dedicated support team for personalized assistance",
                  "Comprehensive company profiles and candidate portfolios",
                  "Secure and confidential job application process"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg">
              <img 
                src="../assets/office-bg.png" 
                alt="Team collaboration" 
                className="rounded-lg w-full h-auto shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Makes Us Different</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine cutting-edge technology with human expertise to deliver exceptional recruitment solutions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="p-4">
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            Join thousands of companies and candidates who have found success with Workly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link to="/signup">Sign Up Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-blue-600 border-blue-600 hover:bg-blue-50">
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
