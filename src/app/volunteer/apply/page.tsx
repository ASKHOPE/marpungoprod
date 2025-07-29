
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Sparkles, AlertTriangle, Loader2 } from 'lucide-react';
import React, { useEffect, useState, Suspense } from 'react';
import type { VolunteerOpportunity as OpportunityType } from '@/types/db';
import { useToast } from '@/hooks/use-toast';

async function getOpportunityData(id: string): Promise<Pick<OpportunityType, 'id' | 'title'> | null> {
  const response = await fetch(`/api/volunteer-opportunities/${id}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to fetch opportunity with ID: ${id}`);
  }
  return response.json();
}

function VolunteerApplyForm() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const opportunityId = searchParams.get('opportunity');
  
  const [opportunityTitle, setOpportunityTitle] = useState<string | null>(null);
  const [isLoadingOpportunity, setIsLoadingOpportunity] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);


  useEffect(() => {
    if (opportunityId) {
      setIsLoadingOpportunity(true);
      setFetchError(null);
      getOpportunityData(opportunityId)
        .then(data => {
          if (data) {
            setOpportunityTitle(data.title);
          } else {
            setOpportunityTitle('Selected Opportunity (Not Found)');
            setFetchError(`Volunteer opportunity with ID "${opportunityId}" not found.`);
          }
        })
        .catch(err => {
          console.error("Failed to fetch opportunity data:", err);
          setFetchError(err instanceof Error ? err.message : 'Failed to load opportunity details.');
          setOpportunityTitle('General Volunteer Application'); 
        })
        .finally(() => setIsLoadingOpportunity(false));
    } else {
      setOpportunityTitle('General Volunteer Application');
      setIsLoadingOpportunity(false);
    }
  }, [opportunityId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!opportunityId && !opportunityTitle?.includes('General')) {
        setSubmissionError('Opportunity ID is missing. Cannot submit application.');
        toast({ title: 'Submission Error', description: 'Opportunity ID is missing.', variant: 'destructive' });
        return;
    }
    setIsSubmitting(true);
    setSubmissionError(null);

    const formData = new FormData(e.currentTarget);
    const applicationData = {
      opportunityId: opportunityId || 'general',
      opportunityTitle: opportunityTitle || 'General Volunteer Application',
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string | undefined,
      interestReason: formData.get('interest') as string,
      skills: formData.get('skills') as string | undefined,
      availability: formData.get('availability') as string | undefined,
    };

    try {
      const response = await fetch('/api/volunteer-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || `Application submission failed: ${response.statusText}`;
         let fieldErrors = '';
        if (errorData.details) {
            fieldErrors = Object.entries(errorData.details).map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`).join('; ');
        }
        setSubmissionError(`${errorMessage}${fieldErrors ? `. Details: ${fieldErrors}`: ''}`);
        toast({ title: 'Application Failed', description: `${errorMessage}${fieldErrors ? `. Details: ${fieldErrors}`: ''}`, variant: 'destructive' });
        throw new Error(errorMessage);
      }
      
      toast({ title: 'Application Submitted!', description: "Thank you! We'll review your application and be in touch." });
      router.push('/volunteer');
    } catch (err) {
      console.error('Application submission error:', err);
      if (!submissionError) {
        setSubmissionError(err instanceof Error ? err.message : 'An unexpected error occurred during submission.');
        toast({ title: 'Submission Error', description: err instanceof Error ? err.message : 'An unexpected error occurred.', variant: 'destructive' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingOpportunity) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
        <p className="text-lg text-foreground/80">Loading application details...</p>
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader className="text-center">
        <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
        <CardTitle className="text-3xl font-headline text-primary">Volunteer Application</CardTitle>
        {fetchError && !opportunityTitle?.includes('Selected Opportunity (Not Found)') && (
          <CardDescription className="text-lg text-destructive pt-2 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 mr-2"/> {fetchError} Proceeding with General Application.
          </CardDescription>
        )}
        {opportunityTitle && (
          <CardDescription className={`text-lg pt-2 ${fetchError && opportunityTitle?.includes('Not Found') ? 'text-destructive' : 'text-foreground/70'}`}>
            {opportunityTitle === 'Selected Opportunity (Not Found)' 
              ? <>Applying for: <span className="font-semibold">Opportunity ID "{opportunityId}"</span> (Details not found)</>
              : <>You are applying for: <span className="font-semibold">{opportunityTitle}</span></>
            }
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" placeholder="e.g., Alex" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" placeholder="e.g., Green" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" placeholder="alex.green@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input id="phone" name="phone" type="tel" placeholder="(123) 456-7890" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interest">Why are you interested in volunteering?</Label>
            <Textarea id="interest" name="interest" placeholder="Share your motivation, relevant experience, and passion for our cause..." rows={4} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Relevant Skills or Experience (Optional)</Label>
            <Textarea id="skills" name="skills" placeholder="List any skills (e.g., gardening, event organizing, teaching) or past volunteer experiences..." rows={3} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="availability">Availability (Optional)</Label>
            <Input id="availability" name="availability" placeholder="e.g., Weekends, weekday evenings" />
          </div>
          {submissionError && (
            <p className="text-sm text-destructive flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> {submissionError}</p>
          )}
          <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-center w-full text-foreground/60">
          We appreciate your interest! Our team will review your application and get in touch if your profile matches our current needs.
        </p>
      </CardFooter>
    </Card>
  );
}

function VolunteerApplyPageLoadingSkeleton() {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Volunteer Opportunities
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-xl text-foreground/80">Loading application form...</p>
        </div>
      </div>
    );
}

export default function VolunteerApplyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/volunteer">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Volunteer Opportunities
          </Link>
        </Button>
      </div>
      <Suspense fallback={<VolunteerApplyPageLoadingSkeleton />}>
        <VolunteerApplyForm />
      </Suspense>
    </div>
  );
}
