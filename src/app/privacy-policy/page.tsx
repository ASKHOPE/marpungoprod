
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ShieldCheck, Users, Database, Mail, Settings, Info } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function PrivacyPolicyPage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <ShieldCheck size={48} className="text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-headline font-bold text-primary mb-4">Privacy Policy</h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          Your privacy is important to us. This Privacy Policy explains how MARPU collects, uses, discloses, and safeguards your information when you visit our website and use our services.
        </p>
        <p className="text-sm text-foreground/70 mt-2">
          Last Updated: {lastUpdated || 'Loading...'}
        </p>
      </section>

      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <Info className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 text-justify">
            <p>Welcome to MARPU! We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at <a href="mailto:privacy@marpu.org" className="text-accent hover:underline">privacy@marpu.org</a>.</p>
            <p>This privacy notice describes how we might use your information if you:
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Visit our website at marpu.org</li>
                <li>Engage with us in other related ways, including any sales, marketing, or events</li>
              </ul>
            </p>
            <p>In this privacy notice, if we refer to:
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>"Website," we are referring to any website of ours that references or links to this policy.</li>
                <li>"Services," we are referring to our Website, and other related services, including any sales, marketing, or events.</li>
              </ul>
            </p>
            <p>The purpose of this privacy notice is to explain to you in the clearest way possible what information we collect, how we use it, and what rights you have in relation to it. If there are any terms in this privacy notice that you do not agree with, please discontinue use of our Services immediately.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <Users className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 text-justify">
            <h3 className="text-xl font-semibold text-primary mb-2">Personal Information You Disclose to Us</h3>
            <p>We collect personal information that you voluntarily provide to us when you register on the Website, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Website (such as posting messages in our online forums or entering competitions, contests or giveaways) or otherwise when you contact us.</p>
            <p>The personal information that we collect depends on the context of your interactions with us and the Website, the choices you make and the products and features you use. The personal information we collect may include the following: names; phone numbers; email addresses; mailing addresses; usernames; passwords; contact preferences; contact or authentication data; billing addresses; debit/credit card numbers; and other similar information.</p>
            
            <h3 className="text-xl font-semibold text-primary mt-4 mb-2">Information Automatically Collected</h3>
            <p>We automatically collect certain information when you visit, use or navigate the Website. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Website and other technical information. This information is primarily needed to maintain the security and operation of our Website, and for our internal analytics and reporting purposes.</p>
            <p>Like many businesses, we also collect information through cookies and similar technologies. You can find out more about this in our Cookie Policy (if applicable, or link to more details).</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <Database className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 text-justify">
            <p>We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations. We indicate the specific processing grounds we rely on next to each purpose listed below.</p>
            <p>We use the information we collect or receive:
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>To facilitate account creation and logon process.</li>
                <li>To post testimonials. We post testimonials on our Website that may contain personal information.</li>
                <li>Request feedback. We may use your information to request feedback and to contact you about your use of our Website.</li>
                <li>To manage user accounts. We may use your information for the purposes of managing our account and keeping it in working order.</li>
                <li>To send administrative information to you.</li>
                <li>To protect our Services.</li>
                <li>To enforce our terms, conditions and policies for business purposes, to comply with legal and regulatory requirements or in connection with our contract.</li>
                <li>To respond to legal requests and prevent harm.</li>
                <li>Fulfill and manage your orders, donations, or event registrations.</li>
                <li>To deliver and facilitate delivery of services to the user.</li>
                <li>To respond to user inquiries/offer support to users.</li>
                <li>To send you marketing and promotional communications.</li>
                <li>Deliver targeted advertising to you.</li>
              </ul>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <ShieldCheck className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              Sharing Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 text-justify">
            <p>We may process or share your data that we hold based on the following legal basis:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li><strong>Consent:</strong> We may process your data if you have given us specific consent to use your personal information for a specific purpose.</li>
                <li><strong>Legitimate Interests:</strong> We may process your data when it is reasonably necessary to achieve our legitimate business interests.</li>
                <li><strong>Performance of a Contract:</strong> Where we have entered into a contract with you, we may process your personal information to fulfill the terms of our contract.</li>
                <li><strong>Legal Obligations:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.</li>
                <li><strong>Vital Interests:</strong> We may disclose your information where we believe it is necessary to investigate, prevent, or take action regarding potential violations of our policies, suspected fraud, situations involving potential threats to the safety of any person and illegal activities, or as evidence in litigation in which we are involved.</li>
            </ul>
            <p>More specifically, we may need to process your data or share your personal information in the following situations: Business Transfers, Affiliates, Business Partners.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <Settings className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              Your Privacy Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 text-justify">
            <p>In some regions (like the European Economic Area and the United Kingdom), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to object to the processing of your personal information.</p>
            <p>If we are relying on your consent to process your personal information, you have the right to withdraw your consent at any time. Please note however that this will not affect the lawfulness of the processing before its withdrawal, nor will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.</p>
            <p>If you have questions or comments about your privacy rights, you may email us at <a href="mailto:privacy@marpu.org" className="text-accent hover:underline">privacy@marpu.org</a>.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <FileText className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              Policy Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/80 text-justify">
            <p>We may update this privacy notice from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible. If we make material changes to this privacy notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <Mail className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
              Contact Us About This Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-foreground/80 text-justify space-y-2">
            <p>If you have questions or comments about this notice, you may email us at <a href="mailto:privacy@marpu.org" className="text-accent hover:underline">donate@marpu.ngo</a> or by post to:</p>
            <p className="font-medium">MARPU Privacy Officer</p>
            <p>East Godavari District,Andhra Pradesh,India</p>
            <p>You can also <Link href="/contact" className="text-accent hover:underline">contact us through our general contact form</Link> for any inquiries.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
