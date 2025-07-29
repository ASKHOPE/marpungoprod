
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress";
import { DollarSign, Leaf, ShieldCheck, Users, Heart, Briefcase, Loader2, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import type { Project as ProjectType } from '@/types/db';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 6; 

async function getActiveProjects(): Promise<ProjectType[]> {
  const response = await fetch('/api/projects');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); 
    throw new Error(errorData.error || 'Failed to fetch active projects');
  }
  return response.json();
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-8 flex items-center justify-center space-x-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page of projects"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>
      <span className="text-sm text-foreground/80">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page of projects"
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
};


export default function DonatePage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const generalDonationLink = process.env.NEXT_PUBLIC_STRIPE_GENERAL_DONATION_LINK;

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !generalDonationLink) {
      toast({
        title: 'Dev Warning: General Donation Link Missing',
        description: 'The NEXT_PUBLIC_STRIPE_GENERAL_DONATION_LINK environment variable is not set. The general donation button will be disabled or may not work correctly.',
        variant: 'destructive',
        duration: 10000,
      });
    }
  }, [toast, generalDonationLink]);

  useEffect(() => {
    setIsLoadingProjects(true);
    setProjectsError(null);
    getActiveProjects()
      .then(data => {
        setProjects(data);
      })
      .catch(err => {
        console.error("Failed to fetch projects:", err);
        setProjectsError(err instanceof Error ? err.message : 'Could not load projects at this time.');
      })
      .finally(() => setIsLoadingProjects(false));
  }, []);

  const handleDonateToProject = (project: ProjectType) => {
    if (project.stripePaymentLinkUrl) {
      try {
        new URL(project.stripePaymentLinkUrl); 
        window.location.href = project.stripePaymentLinkUrl; 
      } catch (_) {
        toast({
          title: 'Invalid Project Payment Link',
          description: `The payment link for "${project.title}" is not a valid URL. Please contact support.`,
          variant: 'destructive',
          duration: 7000,
        });
      }
    } else if (generalDonationLink) {
      toast({
        title: 'Supporting General Fund',
        description: `This project doesn't have a specific donation link. You'll be directed to our general donation page to support efforts like "${project.title}".`,
        duration: 7000,
      });
      window.location.href = generalDonationLink;
    } else {
      toast({
        title: 'Donation Link Unavailable',
        description: `Donation links for "${project.title}" and general support are currently unavailable. Please contact support or try again later.`,
        variant: 'destructive',
      });
    }
  };

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const paginatedProjects = projects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-12">
        <Heart size={48} className="text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-headline font-bold text-primary mb-4">Support Our Mission</h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          Your generous contributions are vital. They empower us to protect fragile ecosystems, support local communities, and drive meaningful, sustainable change. Every donation, big or small, makes a significant difference.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-headline font-semibold text-primary mb-8 text-center">Support a Specific Project</h2>
        {isLoadingProjects ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-10 h-10 text-primary animate-spin mr-3" />
            <p className="text-lg text-foreground/70">Loading projects...</p>
          </div>
        ) : projectsError ? (
          <div className="text-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>{projectsError}</p>
          </div>
        ) : projects.length === 0 ? (
          <p className="text-center text-foreground/70 py-10">No specific projects currently seeking funding. Your general donation is greatly appreciated!</p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedProjects.map((project) => (
                <Card key={project.slug} className="shadow-lg overflow-hidden flex flex-col">
                  <CardHeader className="p-0">
                    <Image
                      src={project.image || 'https://placehold.co/600x300.png'}
                      alt={project.altText || project.title}
                      width={600}
                      height={300}
                      className="object-cover w-full h-48"
                      data-ai-hint={project.imageHint || 'project image'}
                    />
                  </CardHeader>
                  <CardContent className="p-6 flex-grow">
                    <CardTitle className="text-xl font-headline text-primary mb-2">{project.title}</CardTitle>
                    <CardDescription className="text-sm text-foreground/70 mb-4 line-clamp-3">{project.description}</CardDescription>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-foreground/80 mb-1">
                        <span>Raised: ${project.currentAmount.toLocaleString()}</span>
                        <span>Goal: ${project.goalAmount.toLocaleString()}</span>
                      </div>
                      <Progress value={(project.currentAmount / project.goalAmount) * 100} className="h-3" />
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 p-4 mt-auto">
                    <Button 
                        className={`w-full ${project.stripePaymentLinkUrl ? 'bg-primary hover:bg-primary/90' : (generalDonationLink ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-muted hover:bg-muted/80 text-muted-foreground')}`}
                        onClick={() => handleDonateToProject(project)}
                        disabled={!project.stripePaymentLinkUrl && !generalDonationLink}
                    >
                        <Heart className="mr-2 h-5 w-5" /> 
                        {project.stripePaymentLinkUrl ? 'Donate to this Project' : (generalDonationLink ? 'Support via General Fund' : 'Donation Unavailable')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </section>
      
      <section className="mt-16">
        <h2 className="text-3xl font-headline font-semibold text-primary mb-8 text-center">Or Make a General Contribution</h2>
        <Card className="shadow-xl overflow-hidden p-4 md:p-6">
          <div className="md:flex md:items-center md:gap-6">
            <div className="md:w-1/3 md:shrink-0 mb-4 md:mb-0">
              <Image
                src="https://images.unsplash.com/photo-1630068846062-3ffe78aa5049?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Hands holding a sprouting plant"
                width={600}
                height={400}
                className="object-cover w-full h-auto max-h-[200px] md:max-h-[280px] rounded-lg"
                data-ai-hint="donation hands plant"
              />
            </div>
            <div className="md:w-2/3 flex flex-col">
              <CardTitle className="text-2xl font-headline text-primary mb-2 md:mb-4">Support Our Overall Mission</CardTitle>
              <CardDescription className="text-foreground/70 mb-4 md:mb-6 text-base flex-grow">
                Your general donation allows us to direct funds where they are most needed—supporting our core operations, responding to urgent environmental challenges, launching new initiatives, and ensuring the sustainability of Marpu NGO itself. Every contribution helps us stay agile and effective in our mission to foster a greener planet.
              </CardDescription>
              <div className="mt-auto">
                {generalDonationLink ? (
                  <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 w-full sm:w-auto">
                    <a href={generalDonationLink} target="_blank" rel="noopener noreferrer">
                      <DollarSign className="mr-2 h-5 w-5" /> Make a General Donation
                    </a>
                  </Button>
                ) : (
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 w-full sm:w-auto" disabled>
                    <DollarSign className="mr-2 h-5 w-5" /> General Donation (Link Not Configured)
                  </Button>
                )}
                <p className="text-xs text-foreground/60 mt-3">
                  Your donation is securely processed by Stripe. Tax receipts will be issued for eligible donations.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="my-16">
        <h2 className="text-3xl font-headline font-semibold text-primary mb-8 text-center">Where Your General Donation Goes</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 bg-card rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <CardHeader className="p-2">
             <Leaf className="w-12 h-12 text-accent mx-auto mb-4" />
             <CardTitle className="text-xl font-headline font-semibold text-primary mb-2">Reforestation Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70">Funding the planting of native trees to restore critical ecosystems, improve biodiversity, and combat climate change effectively.</p>
            </CardContent>
          </Card>
          <Card className="p-6 bg-card rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <CardHeader className="p-2">
              <ShieldCheck className="w-12 h-12 text-accent mx-auto mb-4" />
              <CardTitle className="text-xl font-headline font-semibold text-primary mb-2">Conservation Efforts</CardTitle>
            </CardHeader>
            <CardContent>
             <p className="text-foreground/70">Supporting the protection of endangered species, preserving their natural habitats, and advocating for stronger environmental policies.</p>
            </CardContent>
          </Card>
          <Card className="p-6 bg-card rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <CardHeader className="p-2">
             <Users className="w-12 h-12 text-accent mx-auto mb-4" />
             <CardTitle className="text-xl font-headline font-semibold text-primary mb-2">Community Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70">Empowering local communities by funding grassroots environmental initiatives, educational workshops, and sustainable development projects.</p>
            </CardContent>
          </Card>
        </div>
      </section>

       <section className="bg-secondary py-12 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Other Ways to Support Marpu NGO</h2>
        <p className="text-foreground/80 mb-6 max-w-lg mx-auto">
          Beyond direct financial donations, you can also support our mission by volunteering your time and skills, organizing a fundraiser, or exploring corporate partnership opportunities. Every contribution helps!
        </p>
        <div className="space-x-4">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/5">
             <Link href="/volunteer">Volunteer With Us</Link>
            </Button>
             <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/5">
                <Link href="/contact?subject=Partnership%20Inquiry">
                  <Briefcase className="mr-2 h-4 w-4"/> Partner With Us or Sponsor
                </Link>
            </Button>
        </div>
      </section>
    </div>
  );
}
