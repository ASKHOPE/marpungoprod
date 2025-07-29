
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { HandHeart, Users, CalendarPlus, MapPin, Sparkles, MessageCircle, Loader2, AlertTriangle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { VolunteerOpportunity as OpportunityType } from '@/types/db';

async function getVolunteerOpportunities(): Promise<OpportunityType[]> {
  const response = await fetch('/api/volunteer-opportunities');
  if (!response.ok) {
    throw new Error('Failed to fetch volunteer opportunities');
  }
  return response.json();
}

export default function VolunteerPage() {
  const [opportunities, setOpportunities] = useState<OpportunityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getVolunteerOpportunities()
      .then(data => {
        setOpportunities(data);
      })
      .catch(err => {
        console.error("Failed to fetch volunteer opportunities data:", err);
        setError('Failed to load volunteer opportunities. Please try again later.');
      })
      .finally(() => setIsLoading(false));
  }, []);


  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xl text-foreground/80">Loading volunteer opportunities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Opportunities</h1>
        <p className="text-foreground/80 mb-8">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <HandHeart className="w-16 h-16 text-accent mx-auto mb-6" />
        <h1 className="text-5xl font-headline font-bold text-primary mb-4">Volunteer With MARPU</h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          Your time, skills, and passion are invaluable to us. Join our vibrant community of dedicated volunteers and make a tangible, positive impact on the environment and our local communities.
        </p>
      </section>

      {opportunities.length === 0 && !isLoading ? (
         <section className="text-center py-10">
          <p className="text-xl text-foreground/70">No volunteer opportunities currently available. Please check back soon!</p>
        </section>
      ) : (
        <section className="mb-12">
          <h2 className="text-3xl font-headline font-semibold text-primary mb-8 text-center">Current Volunteer Opportunities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {opportunities.map((opp) => (
              <Card key={opp.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="p-0">
                  <Image
                    src={opp.image || 'https://placehold.co/600x400.png'}
                    alt={opp.altText || opp.title}
                    width={600}
                    height={400}
                    className="object-cover w-full h-56"
                    data-ai-hint={opp.imageHint || 'volunteer opportunity'}
                  />
                </CardHeader>
                <CardContent className="flex-grow p-6 space-y-3">
                  <CardTitle className="text-2xl font-headline text-primary">{opp.title}</CardTitle>
                  <div className="flex items-center text-sm text-foreground/70">
                    <CalendarPlus className="w-4 h-4 mr-2 text-accent" />
                    <span>Commitment: {opp.commitment}</span>
                  </div>
                  <div className="flex items-center text-sm text-foreground/70">
                    <MapPin className="w-4 h-4 mr-2 text-accent" />
                    <span>Location: {opp.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-foreground/70">
                    <Sparkles className="w-4 h-4 mr-2 text-accent" />
                    <span>Skills: {opp.skills}</span>
                  </div>
                  <CardDescription className="text-foreground/70 pt-2 text-base line-clamp-3">{opp.description}</CardDescription>
                </CardContent>
                <CardFooter className="p-6 bg-secondary/30">
                  <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href={`/volunteer/apply?opportunity=${opp.id}`}>Apply Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="bg-primary/10 p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Why Volunteer With MARPU?</h2>
        <div className="grid md:grid-cols-3 gap-6 text-foreground/80 mb-6">
          <div className="p-4">
            <Users className="w-10 h-10 text-accent mx-auto mb-2" />
            <h3 className="font-semibold text-lg">Make a Real Difference</h3>
            <p className="text-sm">Directly contribute to vital environmental protection efforts and foster community well-being through your actions.</p>
          </div>
          <div className="p-4">
            <Sparkles className="w-10 h-10 text-accent mx-auto mb-2" />
            <h3 className="font-semibold text-lg">Learn & Grow</h3>
            <p className="text-sm">Gain valuable experience in conservation, event management, environmental education, community outreach, and more.</p>
          </div>
          <div className="p-4">
            <HandHeart className="w-10 h-10 text-accent mx-auto mb-2" />
            <h3 className="font-semibold text-lg">Join a Community</h3>
            <p className="text-sm">Connect with a diverse group of like-minded, passionate individuals who share your commitment to the planet.</p>
          </div>
        </div>
        <p className="text-foreground/70 mb-6">
          Can&apos;t find an opportunity that perfectly fits your skills or schedule? We&apos;re always open to new ideas and innovative ways volunteers can contribute their unique talents.
        </p>
        <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/5">
          <Link href="/contact?subject=Volunteer%20Role%20Suggestion">
            <MessageCircle className="mr-2 h-5 w-5" /> Suggest a Volunteer Role
          </Link>
        </Button>
      </section>
    </div>
  );
}
