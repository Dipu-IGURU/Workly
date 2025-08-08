import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsAndConditions = () => {
  const lastUpdated = "January 1, 2024";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Terms and Conditions</h1>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">1. Introduction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Welcome to Can Hiring ("we," "our," or "us"). These Terms and Conditions ("Terms") govern your use of our website and services. By accessing or using our platform, you agree to be bound by these Terms and our Privacy Policy.
            </p>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. Definitions</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>"Platform"</strong> refers to the Can Hiring website, mobile applications, and related services.</li>
                <li><strong>"User"</strong> means any individual or entity that accesses or uses our Platform.</li>
                <li><strong>"Job Seeker"</strong> refers to Users seeking employment opportunities.</li>
                <li><strong>"Employer"</strong> refers to Users posting job listings or seeking candidates.</li>
                <li><strong>"Content"</strong> includes all text, images, videos, and other materials on the Platform.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. Account Registration</h2>
              <p className="text-muted-foreground">
                To access certain features, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information as needed.
              </p>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use of your account.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. User Responsibilities</h2>
              <p className="text-muted-foreground">
                As a User, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide accurate and truthful information in your profile and applications</li>
                <li>Use the Platform only for lawful purposes</li>
                <li>Not engage in any activity that interferes with or disrupts the Platform</li>
                <li>Not use the Platform to post false, misleading, or fraudulent information</li>
                <li>Not use the Platform to transmit any viruses or malicious code</li>
                <li>Not attempt to gain unauthorized access to other Users' accounts</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Job Listings and Applications</h2>
              <p className="text-muted-foreground">
                Employers are solely responsible for their job postings and the hiring process. Can Hiring does not guarantee the accuracy of job listings or the availability of positions.
              </p>
              <p className="text-muted-foreground">
                Job Seekers are responsible for the accuracy of their applications and for conducting their own due diligence regarding potential employers.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Intellectual Property</h2>
              <p className="text-muted-foreground">
                All Content on the Platform, including text, graphics, logos, and software, is the property of Can Hiring or its licensors and is protected by copyright and other intellectual property laws.
              </p>
              <p className="text-muted-foreground">
                You may not reproduce, distribute, modify, or create derivative works of any Content without our prior written consent.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, Can Hiring shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Termination</h2>
              <p className="text-muted-foreground">
                We may suspend or terminate your access to the Platform at any time, with or without cause, and without notice. Upon termination, your right to use the Platform will immediately cease.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law principles.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">10. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will provide notice of any changes by updating the "Last Updated" date at the top of this page. Your continued use of the Platform after such modifications constitutes your acceptance of the revised Terms.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">11. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms, please contact us at legal@workly.com.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;
