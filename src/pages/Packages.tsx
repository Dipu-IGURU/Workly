import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CheckCircle, Clock, Crown, Rocket, Star, Zap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular: boolean;
  recommended: boolean;
  buttonText: string;
}

const Packages = () => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const pricingPlans: PricingPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Free',
      description: 'Perfect for job seekers getting started',
      features: [
        'Basic job search',
        'Apply to 5 jobs per month',
        'Email support',
        'Basic profile visibility',
        'Job alerts (3 per day)'
      ],
      popular: false,
      recommended: false,
      buttonText: 'Current Plan'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$9.99',
      description: 'For serious job seekers',
      features: [
        'Unlimited job applications',
        'Priority job listings',
        '24/7 Email & Chat support',
        'Enhanced profile visibility',
        'Unlimited job alerts',
        'Resume builder',
        'Interview preparation'
      ],
      popular: true,
      recommended: true,
      buttonText: 'Upgrade Now'
    },
    {
      id: 'business',
      name: 'Business',
      price: '$19.99',
      description: 'For professionals who want the best',
      features: [
        'Everything in Professional',
        'Direct recruiter access',
        'Premium profile badge',
        '1-on-1 career coaching',
        'Advanced analytics',
        'Custom resume templates',
        'Priority support',
        'LinkedIn profile optimization'
      ],
      popular: false,
      recommended: false,
      buttonText: 'Get Business'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: 'For organizations and teams',
      features: [
        'Everything in Business',
        'Dedicated account manager',
        'Team management',
        'Custom integrations',
        'API access',
        'Custom training',
        'SLA 99.9% uptime',
        'White-label solutions'
      ],
      popular: false,
      recommended: false,
      buttonText: 'Contact Sales'
    }
  ];

  const handleSelectPlan = (planId: string) => {
    setIsLoading(prev => ({ ...prev, [planId]: true }));
    
    // Simulate API call
    setTimeout(() => {
      setSelectedPlan(planId);
      setIsLoading(prev => ({ ...prev, [planId]: false }));
      
      toast({
        title: "Plan Selected",
        description: `You've selected the ${pricingPlans.find(p => p.id === planId)?.name} plan.`,
      });
    }, 1000);
  };

  const FeatureItem = ({ text, included = true }: { text: string, included?: boolean }) => (
    <li className="flex items-center space-x-2">
      {included ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <span className="h-4 w-4"></span>
      )}
      <span className={included ? 'text-foreground' : 'text-muted-foreground line-through'}>
        {text}
      </span>
    </li>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan that fits your job search needs. All plans include our 14-day money-back guarantee.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {pricingPlans.map((plan) => (
          <div key={plan.id} className="relative">
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  <Zap className="h-3 w-3" />
                  POPULAR
                </Badge>
              </div>
            )}
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  <Star className="h-3 w-3" />
                  RECOMMENDED
                </Badge>
              </div>
            )}
            <Card className={`h-full flex flex-col ${
              plan.popular 
                ? 'ring-2 ring-blue-500 dark:ring-blue-400' 
                : plan.recommended 
                  ? 'ring-2 ring-green-500 dark:ring-green-400' 
                  : 'border border-gray-200 dark:border-gray-800'
            }`}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="mt-1">{plan.description}</CardDescription>
                  </div>
                  {plan.id === 'enterprise' && (
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <div className="text-4xl font-bold">
                    {plan.price}
                    {plan.id !== 'basic' && plan.id !== 'enterprise' && (
                      <span className="text-base font-normal text-muted-foreground">/month</span>
                    )}
                  </div>
                  {plan.id === 'professional' && (
                    <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Save 20% with annual billing
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <FeatureItem key={index} text={feature} />
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-6">
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                      : plan.recommended
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                        : ''
                  }`}
                  size="lg"
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading[plan.id] || selectedPlan === plan.id}
                >
                  {isLoading[plan.id] ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Can I change my plan later?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated.
            </p>
          </div>
          <div>
            <h3 className="font-medium">Is there a free trial available?</h3>
            <p className="text-muted-foreground">
              Yes, all paid plans come with a 14-day free trial. No credit card required to start your trial.
            </p>
          </div>
          <div>
            <h3 className="font-medium">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards including Visa, MasterCard, American Express, and PayPal.
            </p>
          </div>
          <div>
            <h3 className="font-medium">How does the money-back guarantee work?</h3>
            <p className="text-muted-foreground">
              If you're not satisfied with our service, you can request a full refund within 14 days of your purchase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Packages;
