
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Send, Loader2, AlertTriangle, StampIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const subjectOptions = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'partnership', label: 'Partnership Inquiry' },
  { value: 'sponsorship', label: 'Sponsorship Opportunity' },
  { value: 'event', label: 'Event Question' },
  { value: 'volunteer', label: 'Volunteering Question' },
  { value: 'other', label: 'Other (Please specify)' },
];

function ContactPageComponent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const initialSubjectQuery = searchParams.get('subject');

  const [selectedSubject, setSelectedSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');


  useEffect(() => {
    const predefinedSubject = subjectOptions.find(opt => opt.label === initialSubjectQuery || opt.value === initialSubjectQuery);

    if (predefinedSubject) {
      setSelectedSubject(predefinedSubject.value);
      if (predefinedSubject.value === 'other' && initialSubjectQuery && !subjectOptions.some(opt => opt.label === initialSubjectQuery)) {
        setCustomSubject(initialSubjectQuery);
      }
    } else if (initialSubjectQuery) {
      setSelectedSubject('other');
      setCustomSubject(initialSubjectQuery);
    } else {
      setSelectedSubject('general');
    }
  }, [initialSubjectQuery]);

  const handleSubjectChange = (value: string) => {
    setSelectedSubject(value);
    if (value !== 'other') {
      setCustomSubject('');
    }
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const finalSubject = selectedSubject === 'other' ? customSubject : subjectOptions.find(s => s.value === selectedSubject)?.label;

    if (!finalSubject) {
        setFormError('Subject is required.');
        setIsSubmitting(false);
        return;
    }
    if (selectedSubject === 'other' && !customSubject.trim()) {
        setFormError('Please specify your subject when selecting "Other".');
        setIsSubmitting(false);
        return;
    }

    const formData = {
      firstName,
      lastName,
      email,
      subject: finalSubject,
      message,
    };

    try {
      const response = await fetch('/api/contact-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.error || `Failed to send message: ${response.statusText}`;
        if (errorData.details) {
            const fieldErrors = Object.entries(errorData.details).map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`).join('; ');
            errorMessage += ` Details: ${fieldErrors}`;
        }
        setFormError(errorMessage);
        toast({
          title: 'Error Sending Message',
          description: errorMessage,
          variant: 'destructive',
        });
        throw new Error(errorMessage);
      }
      
      toast({
        title: 'Message Sent!',
        description: "Thank you for contacting us. We'll be in touch soon.",
      });
      setFirstName('');
      setLastName('');
      setEmail('');
      setSelectedSubject('general');
      setCustomSubject('');
      setMessage('');
    } catch (err) {
      console.error('Contact form submission error:', err);
      if (!formError) { 
         setFormError(err instanceof Error ? err.message : 'An unexpected error occurred.');
         toast({
            title: 'Submission Error',
            description: err instanceof Error ? err.message : 'An unexpected error occurred.',
            variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <Mail size={48} className="text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-headline font-bold text-primary mb-4">Get In Touch With MARPU</h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          We&apos;d love to hear from you! Whether you have a question about our projects, a suggestion for an event, or want to explore partnership opportunities, please feel free to reach out.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-start">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Send Us a Message</CardTitle>
            <CardDescription className="text-foreground/70">
              Fill out the form below, and our team will get back to you as soon as possible. We aim to respond within 2 business days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="john.doe@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject-select">Subject</Label>
                <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                  <SelectTrigger id="subject-select" className="w-full">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedSubject === 'other' && (
                <div className="space-y-2">
                  <Label htmlFor="customSubject">Custom Subject</Label>
                  <Input 
                    id="customSubject" 
                    name="customSubject" 
                    placeholder="Please specify your subject" 
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    required={selectedSubject === 'other'} 
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" placeholder="Your detailed message here..." value={message} onChange={e => setMessage(e.target.value)} rows={5} required minLength={10} />
              </div>
               {formError && (
                <p className="text-sm text-destructive flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" /> {formError}
                </p>
              )}
              <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-foreground/60">
              We typically respond within 1-2 business days. For urgent matters, please call us.
            </p>
          </CardFooter>
        </Card>

        <div className="space-y-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-primary">Our Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-foreground/80">
              <div className="flex items-center">
                <StampIcon className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
                President and Administrator - Undurthi John Kumar
              </div>
                <div className="flex items-center">
                <MapPin className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
                <span>East Godavari District,Andhra Pradesh,India</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
                <a href="mailto:info@marpu.org" className="hover:text-primary transition-colors">donate@marpu.ngo</a>
              </div>
              <div className="flex items-center">
                <Phone className="w-6 h-6 mr-3 text-accent flex-shrink-0" />
                <a href="tel:+1234567890" className="hover:text-primary transition-colors">+918822669988</a>
              </div>
            
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-headline text-primary">Office Hours</CardTitle>
            </CardHeader>
            <CardContent className="text-foreground/80">
              <p><strong className="font-medium">Monday - Friday:</strong> 9:00 AM - 5:00 PM (Local Time)</p>
              <p><strong className="font-medium">Saturday - Sunday:</strong> Closed</p>
              <p className="mt-2 text-sm">Please note, we observe all major public holidays. Meetings by appointment are encouraged.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}


function ContactPageLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-xl text-foreground/80">Loading contact page...</p>
    </div>
  );
}

export default function ContactPageWrapper() {
  return (
    <Suspense fallback={<ContactPageLoadingSkeleton />}>
      <ContactPageComponent />
    </Suspense>
  );
}
