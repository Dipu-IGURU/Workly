import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicy = () => {
  const lastUpdated = "January 1, 2024";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
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
              At Workly ("we," "our," or "us"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services. Please read this policy carefully. If you do not agree with the terms of this policy, please do not access the site.
            </p>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
              <p className="text-muted-foreground">
                We collect several types of information from and about users of our Platform, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Personal Information:</strong> Name, email address, phone number, postal address, and other contact information.</li>
                <li><strong>Professional Information:</strong> Work history, education, skills, certifications, and other career-related information.</li>
                <li><strong>Account Credentials:</strong> Username, password, and other authentication details.</li>
                <li><strong>Usage Data:</strong> Information about how you use our Platform, including search history, job applications, and interactions with employers.</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, and other technical details about your device.</li>
                <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tracking technologies to track activity on our Platform.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
              <p className="text-muted-foreground">
                We may use the information we collect for various purposes, including to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Provide, maintain, and improve our services</li>
                <li>Process and complete transactions</li>
                <li>Match job seekers with potential employers</li>
                <li>Send you job alerts and notifications</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send you technical notices, updates, and security alerts</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
                <li>Comply with legal obligations and protect our rights</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">4. How We Share Your Information</h2>
              <p className="text-muted-foreground">
                We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>With Employers:</strong> When you apply for a job, we share your application materials with the relevant employer.</li>
                <li><strong>Service Providers:</strong> We may employ third-party companies and individuals to facilitate our services, provide services on our behalf, or assist us in analyzing how our Platform is used.</li>
                <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
                <li><strong>With Your Consent:</strong> We may share your information for any other purpose with your consent.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">5. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect the security of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">6. Your Data Protection Rights</h2>
              <p className="text-muted-foreground">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong>Access:</strong> Request access to your personal information.</li>
                <li><strong>Correction:</strong> Request correction of the personal information we hold about you.</li>
                <li><strong>Erasure:</strong> Request erasure of your personal information.</li>
                <li><strong>Restriction:</strong> Request restriction of processing of your personal information.</li>
                <li><strong>Data Portability:</strong> Request transfer of your personal information to another service.</li>
                <li><strong>Withdraw Consent:</strong> Withdraw your consent at any time where we rely on your consent to process your personal information.</li>
              </ul>
              <p className="text-muted-foreground">
                To exercise any of these rights, please contact us using the information in the "Contact Us" section below.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">7. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground">
                We use cookies and similar tracking technologies to track activity on our Platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Platform.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">8. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our Platform is not intended for individuals under the age of 16. We do not knowingly collect personal information from children under 16. If we become aware that we have collected personal information from a child under 16, we will take steps to delete such information.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">9. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">10. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at privacy@workly.com or by mail at:
              </p>
              <address className="not-italic text-muted-foreground">
                Workly Inc.<br />
                Attn: Privacy Officer<br />
                123 Privacy Street<br />
                Tech City, TC 12345<br />
                Country
              </address>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
