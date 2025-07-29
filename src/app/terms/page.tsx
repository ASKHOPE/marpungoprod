
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertTriangle, UserCheck, CheckSquare, Users, Globe, Scale, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function TermsPage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <FileText size={48} className="text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-headline font-bold text-primary mb-4">Terms and Conditions</h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          Please read these terms and conditions carefully before using Our Service. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
        </p>
        <p className="text-sm text-foreground/70 mt-2">
          Last updated: {lastUpdated || 'Loading...'}
        </p>
      </section>

      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <Scale className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              Interpretation and Definitions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-foreground/80 text-justify">
            <section>
              <h2 className="text-xl font-semibold text-primary mb-2">Interpretation</h2>
              <p>The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-primary mb-2">Definitions</h2>
              <p>For the purposes of these Terms and Conditions:</p>
              <ul className="list-disc list-inside space-y-2 mt-2 pl-4">
                <li><strong>Application</strong> means the software program provided by the Company downloaded by You on any electronic device, named Marpu, and the website accessible from marpu.org.</li>
                <li><strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Marpu, 123 Change St, Progress City, Nation 12345.</li>
                <li><strong>Content</strong> refers to content such as text, images, or other information that can be posted, uploaded, linked to or otherwise made available by You, regardless of the form of that content.</li>
                <li><strong>Country</strong> refers to: [Your Country/Jurisdiction of Operation].</li>
                <li><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
                <li><strong>Service</strong> refers to the Application and the Website.</li>
                <li><strong>Terms and Conditions</strong> (also referred as "Terms") mean these Terms and Conditions that form the entire agreement between You and the Company regarding the use of the Service.</li>
                <li><strong>Third-party Social Media Service</strong> means any services or content (including data, information, products or services) provided by a third-party that may be displayed, included or made available by the Service.</li>
                <li><strong>You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.</li>
              </ul>
            </section>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <UserCheck className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              Acknowledgment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 text-justify">
            <p>These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.</p>
            <p>Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.</p>
            <p>By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.</p>
            <p>You represent that you are at least 13 years of age. The Company does not knowingly permit those under 13 to use the Service without parental consent. If you are under 18, you represent that you have your parent or guardian’s permission to use the Service.</p>
            <p>Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the Privacy Policy of the Company. Our Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your personal information when You use the Application or the Website and tells You about Your privacy rights and how the law protects You. Please read Our <Link href="/privacy-policy" className="text-accent hover:underline">Privacy Policy</Link> carefully before using Our Service.</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <Users className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              User Accounts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 text-justify">
            <p>When You create an account with Us, You must provide Us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of Your account on Our Service.</p>
            <p>You are responsible for safeguarding the password that You use to access the Service and for any activities or actions under Your password, whether Your password is with Our Service or a Third-Party Social Media Service.</p>
            <p>You agree not to disclose Your password to any third party. You must notify Us immediately upon becoming aware of any breach of security or unauthorized use of Your account.</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <Globe className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              Links to Other Websites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 text-justify">
            <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by the Company.</p>
            <p>The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such web sites or services.</p>
            <p>We strongly advise You to read the terms and conditions and privacy policies of any third-party web sites or services that You visit.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <AlertTriangle className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 text-justify">
            <p>We may terminate or suspend Your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.</p>
            <p>Upon termination, Your right to use the Service will cease immediately. If You wish to terminate Your account, You may simply discontinue using the Service.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
             <CheckSquare className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              Changes to These Terms and Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 text-justify">
            <p>We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.</p>
            <p>By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the website and the Service.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <MessageSquare className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="text-foreground/80 text-justify">
            <p>If you have any questions about these Terms and Conditions, You can contact us:</p>
            <ul className="list-disc list-inside space-y-1 mt-2 pl-4">
              <li>By email: <a href="mailto:terms@marpu.org" className="text-accent hover:underline">terms@marpu.org</a></li>
              <li>By visiting this page on our website: <Link href="/contact" className="text-accent hover:underline">marpu.org/contact</Link></li>
              <li>By mail: 123 Change St, Progress City, Nation 12345, Attn: Legal Department</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
