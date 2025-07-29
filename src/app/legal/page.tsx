
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, FileText, Copyright, Accessibility, Info } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LegalPage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <ShieldCheck className="w-16 h-16 text-accent mx-auto mb-6" />
        <h1 className="text-5xl font-headline font-bold text-primary mb-4">Legal & Compliance</h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          Key information regarding our legal framework, operational policies, and steadfast adherence to relevant regulations for MARPU.
        </p>
        <p className="text-sm text-foreground/70 mt-2">
          Last updated: {lastUpdated || 'Loading...'}
        </p>
      </section>

      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <FileText className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              Privacy Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 text-justify">
            <p>Our Privacy Policy comprehensively outlines how MARPU collects, uses, maintains, and discloses information collected from users (each, a "User") of the marpu.org website ("Site") and our associated mobile application. This privacy policy applies to the Site and all products and services offered by MARPU.</p>
            <p>We are unequivocally committed to protecting your personal information and your fundamental right to privacy. Should you have any questions or concerns about our policy, or our practices with regards to your personal information, please do not hesitate to contact us.</p>
            <p><Link href="/privacy-policy" className="text-accent hover:underline font-medium">Read our full Privacy Policy &rarr;</Link></p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <FileText className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              Terms of Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 text-justify">
            <p>Please read these Terms of Service ("Terms", "Terms of Service") meticulously before using the marpu.org website and MARPU mobile application (collectively, the "Service") operated by MARPU ("us", "we", or "our").</p>
            <p>Your access to and use of the Service is strictly conditioned upon your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who wish to access or use the Service. By accessing or using the Service, you agree to be bound by these Terms.</p>
            <p><Link href="/terms" className="text-accent hover:underline font-medium">Read our full Terms of Service &rarr;</Link></p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <Copyright className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              Copyright & Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 text-justify">
            <p>The Service and its original content (excluding Content provided by users), distinctive features, and functionality are and will remain the exclusive property of MARPU and its licensors. The Service is protected by copyright, trademark, and other laws of both our country of operation and foreign countries.</p>
            <p>Our trademarks, trade dress, and other intellectual property may not be used in connection with any product or service without the prior express written consent of MARPU. Any unauthorized use of our intellectual property is strictly prohibited and may result in legal action. This includes all text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software.</p>
             <p>If you believe that any content on our Service infringes upon your copyright, please notify us by providing a written notice to our designated Copyright Agent at <a href="mailto:copyright@marpu.org" className="text-accent hover:underline">copyright@marpu.org</a> or via our <Link href="/contact" className="text-accent hover:underline">contact page</Link>.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
                <Accessibility className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
                Accessibility Statement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 text-justify">
            <p>MARPU is firmly committed to ensuring digital accessibility for people with disabilities. We are continually striving to improve the user experience for everyone and applying the relevant accessibility standards, such as the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, to the best of our ability.</p>
            <p>Our efforts to enhance accessibility are ongoing. We aim to make our website and services usable by the widest possible audience, regardless of technology or ability. This includes considerations for keyboard navigation, screen reader compatibility, text contrast, and alternative text for images.</p>
            <p>We warmly welcome your feedback on the accessibility of MARPU. Please let us know if you encounter accessibility barriers on our platform by contacting us at <a href="mailto:accessibility@marpu.org" className="text-accent hover:underline">accessibility@marpu.org</a>. We take your feedback seriously and will consider it as we evaluate ways to accommodate all of our users and our overall accessibility policies.</p>
          </CardContent>
        </Card>

         <Card className="shadow-lg mt-8">
            <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
                <Info className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
                Contacting Us About Legal Matters
            </CardTitle>
            </CardHeader>
            <CardContent className="text-foreground/80 text-justify space-y-2">
            <p>If you have any questions about this Legal Compliance information, the practices of this site, or your dealings with this site, please contact our legal department:</p>
            <p className="font-medium">MARPU Legal Team</p>
            <p>Website: <Link href="/legal" className="text-accent hover:underline">marpu.ngo/legal</Link></p>
            <p>Mailing Address: East Godavari District,Andhra Pradesh,India</p>
            <p>Email: <a href="mailto:legal@marpu.org" className="text-accent hover:underline">donate@marpu.ngo</a></p>
            <p>For general inquiries, please visit our <Link href="/contact" className="text-accent hover:underline">Contact Page</Link>.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
