import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, MessageSquare, User, Briefcase, CreditCard, Lock, Bell } from "lucide-react";
import { useState } from "react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: "General",
      icon: <MessageSquare className="h-5 w-5 text-primary" />,
      questions: [
        {
          question: "What is Can Hiring?",
          answer: "Can Hiring is a comprehensive job portal that connects job seekers with employers. We provide a platform for finding jobs, managing applications, and connecting with potential employers."
        },
        {
          question: "Is Can Hiring free to use?",
          answer: "Yes, Can Hiring is completely free for job seekers. You can create a profile, search for jobs, and apply to as many positions as you like without any cost."
        },
        {
          question: "How do I create an account?",
          answer: "Click on the 'Sign Up' button in the top right corner, fill in your details, and follow the verification process to create your account."
        }
      ]
    },
    {
      category: "For Job Seekers",
      icon: <User className="h-5 w-5 text-primary" />,
      questions: [
        {
          question: "How do I apply for a job?",
          answer: "Find a job you're interested in, click on 'Apply Now', and follow the application process. Make sure your profile is complete before applying."
        },
        {
          question: "Can I track my job applications?",
          answer: "Yes, you can track all your applications in the 'Applied Jobs' section of your dashboard."
        },
        {
          question: "How do I upload my resume?",
          answer: "Go to your profile settings and click on 'Upload Resume' to add or update your resume."
        }
      ]
    },
    {
      category: "For Employers",
      icon: <Briefcase className="h-5 w-5 text-primary" />,
      questions: [
        {
          question: "How do I post a job?",
          answer: "Create an employer account, go to your dashboard, and click on 'Post a New Job'. Fill in the job details and submit for approval."
        },
        {
          question: "How much does it cost to post a job?",
          answer: "We offer various pricing plans for employers. Please check our 'Pricing' page for detailed information."
        },
        {
          question: "How do I review applications?",
          answer: "All applications for your job postings can be found in your employer dashboard under 'Applications'."
        }
      ]
    },
    {
      category: "Account & Billing",
      icon: <CreditCard className="h-5 w-5 text-primary" />,
      questions: [
        {
          question: "How do I update my payment method?",
          answer: "Go to 'Billing' in your account settings to update or change your payment method."
        },
        {
          question: "Can I cancel my subscription?",
          answer: "Yes, you can cancel your subscription at any time in the 'Billing' section of your account."
        },
        {
          question: "Where can I view my invoices?",
          answer: "All your invoices are available in the 'Billing' section under 'Invoices'."
        }
      ]
    },
    {
      category: "Privacy & Security",
      icon: <Lock className="h-5 w-5 text-primary" />,
      questions: [
        {
          question: "How is my data protected?",
          answer: "We use industry-standard encryption and security measures to protect your data. Please review our Privacy Policy for more details."
        },
        {
          question: "Can I delete my account?",
          answer: "Yes, you can delete your account in the 'Account Settings' under 'Danger Zone'."
        },
        {
          question: "How do I report a security concern?",
          answer: "Please contact our support team immediately at security@workly.com to report any security concerns."
        }
      ]
    },
    {
      category: "Notifications",
      icon: <Bell className="h-5 w-5 text-primary" />,
      questions: [
        {
          question: "How do I manage email notifications?",
          answer: "You can manage your notification preferences in the 'Notifications' section of your account settings."
        },
        {
          question: "Why am I not receiving job alerts?",
          answer: "Check your spam/junk folder and ensure your email settings allow emails from @workly.com. Also, verify your notification preferences in your account settings."
        },
        {
          question: "Can I get SMS notifications?",
          answer: "Yes, you can enable SMS notifications in the 'Notifications' section of your account settings."
        }
      ]
    }
  ];

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Can't find the answer you're looking for? Check out our help center or contact our support team.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="mb-8 border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {category.icon}
                  </div>
                  <CardTitle className="text-xl">{category.category}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {category.questions.map((item, index) => {
                    const questionIndex = category.questions.slice(0, index).length + categoryIndex * 3 + index;
                    return (
                      <div key={index} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                        <button
                          className="flex items-center justify-between w-full text-left py-3 font-medium text-foreground hover:text-primary transition-colors"
                          onClick={() => toggleQuestion(questionIndex)}
                        >
                          <span>{item.question}</span>
                          <ChevronDown 
                            className={`h-5 w-5 transition-transform ${openIndex === questionIndex ? 'transform rotate-180' : ''}`} 
                          />
                        </button>
                        {openIndex === questionIndex && (
                          <div className="pb-3 text-muted-foreground text-sm">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 bg-primary/5 p-8 rounded-lg max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <Button variant="default" className="gap-2">
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
