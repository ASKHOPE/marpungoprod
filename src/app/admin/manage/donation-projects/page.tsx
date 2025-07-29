
'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertTriangle, PlusCircle, Edit, Trash2, ArrowLeft, Package, Filter } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/types/db';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const processMongoId = (item: any) => ({ ...item, _id: item._id?.toString() });

type FilterType = 'all' | 'active' | 'funded' | 'archived';

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  fundedProjects: number;
  archivedProjects: number;
}

function ManageDonationProjectsPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [allProjects, setAllProjects] = useState<Project[]>([]); 
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>( (searchParams.get('filter') as FilterType) || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [projectCounts, setProjectCounts] = useState<ProjectStats | null>(null);

  const fetchPageData = useCallback(async (filter: FilterType) => {
    setLoading(true);
    setError(null);
    try {
      const [projectsResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/manage/projects?status=${filter}`),
        fetch('/api/admin/stats')
      ]);

      if (!projectsResponse.ok) {
        const errorData = await projectsResponse.json();
        throw new Error(errorData.error || `Failed to fetch projects: ${projectsResponse.statusText}`);
      }
      const data = (await projectsResponse.json()).map(processMongoId);
      setAllProjects(data); 

      if (!statsResponse.ok) {
        console.warn(`Failed to fetch stats for counts: ${statsResponse.statusText}`);
        setProjectCounts(null);
      } else {
        const statsData = await statsResponse.json();
        setProjectCounts({
            totalProjects: statsData.totalProjects,
            activeProjects: statsData.activeProjects,
            fundedProjects: statsData.fundedProjects,
            archivedProjects: statsData.archivedProjects,
        });
      }

    } catch (err) {
      console.error('Failed to fetch projects or stats:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      toast({
        title: "Error Fetching Data",
        description: err instanceof Error ? err.message : 'Could not load projects data or counts.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const filterFromParams = (searchParams.get('filter') as FilterType) || 'all';
    setActiveFilter(filterFromParams);
    fetchPageData(filterFromParams);
  }, [fetchPageData, searchParams]);

  useEffect(() => {
    let currentProjects = [...allProjects];
    if (searchTerm.trim()) {
      currentProjects = currentProjects.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.slug.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProjects(currentProjects);
  }, [searchTerm, allProjects]);


  const handleFilterChange = (newFilter: FilterType) => {
    setActiveFilter(newFilter);
    setSearchTerm(''); 
    router.push(`/admin/manage/donation-projects?filter=${newFilter}`, { scroll: false });
  };

  const handleDeleteProject = async (projectId: string | undefined) => {
    if (!projectId) {
      toast({ title: "Error", description: "Project ID is missing.", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`/api/admin/manage/projects/${projectId}`, { method: 'DELETE' });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to delete project');
      }
      toast({ 
        title: "Success", 
        description: `Project deleted successfully. ${responseData.stripeWarning ? 'Stripe Warning: ' + responseData.stripeWarning : ''}` 
      });
      fetchPageData(activeFilter); 
    } catch (err) {
      console.error('Failed to delete project:', err);
      toast({
        title: "Error Deleting Project",
        description: err instanceof Error ? err.message : 'Could not delete project.',
        variant: "destructive",
      });
    }
  };

  if (loading && allProjects.length === 0) { 
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xl text-foreground/80">Loading donation projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Projects</h1>
        <p className="text-foreground/80 mb-8">{error}</p>
        <Button onClick={() => fetchPageData(activeFilter)} variant="outline">Try Again</Button>
         <Button asChild variant="link" className="mt-4">
          <Link href="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold text-primary flex items-center">
          <Package className="w-8 h-8 mr-3 text-accent" /> Manage Donation Projects
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <Button
                key="all"
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('all')}
            >
                All ({projectCounts?.totalProjects || 0})
            </Button>
            <Button
                key="active"
                variant={activeFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('active')}
            >
                Active ({projectCounts?.activeProjects || 0})
            </Button>
            <Button
                key="funded"
                variant={activeFilter === 'funded' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('funded')}
            >
                Funded ({projectCounts?.fundedProjects || 0})
            </Button>
            <Button
                key="archived"
                variant={activeFilter === 'archived' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange('archived')}
            >
                Archived ({projectCounts?.archivedProjects || 0})
            </Button>
        </div>
        <Input
            placeholder="Search by title or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
        />
      </div>


      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-headline text-primary">
            {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Projects ({loading ? <Loader2 className="inline w-4 h-4 animate-spin" /> : filteredProjects.length})
          </CardTitle>
          <Button asChild size="sm">
            <Link href="/admin/manage/donation-projects/new"><PlusCircle className="w-4 h-4 mr-2" /> Add New Project</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading && filteredProjects.length === 0 ? (
             <div className="py-8 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                <p className="text-foreground/70">Loading projects...</p>
             </div>
          ) : !loading && filteredProjects.length === 0 ? (
             <div className="text-center py-8">
              <p className="text-foreground/70 mb-4">
                {searchTerm ? `No projects found matching "${searchTerm}" with status "${activeFilter}".` : `No projects found with status "${activeFilter}".`}
              </p>
              {activeFilter === 'all' && !searchTerm && (
                <Button asChild>
                  <Link href="/admin/manage/donation-projects/new"><PlusCircle className="w-4 h-4 mr-2" /> Add Your First Project</Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Goal</TableHead>
                  <TableHead className="hidden sm:table-cell">Raised</TableHead>
                  <TableHead className="hidden lg:table-cell">Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project._id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell className="hidden md:table-cell"><code className="text-xs bg-muted p-1 rounded">{project.slug}</code></TableCell>
                    <TableCell>
                      <Badge 
                        variant={project.status === 'active' ? 'default' : project.status === 'funded' ? 'secondary' : 'outline'}
                        className={`text-xs ${
                          project.status === 'active' ? 'bg-green-500 text-white' : 
                          project.status === 'funded' ? 'bg-blue-500 text-white' : 
                          'border-slate-400 text-slate-500'
                        }`}
                      >
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">${project.goalAmount.toLocaleString()}</TableCell>
                    <TableCell className="hidden sm:table-cell">${project.currentAmount.toLocaleString()}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Progress value={(project.currentAmount / project.goalAmount) * 100} className="h-2.5 w-24" />
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/manage/donation-projects/edit/${project._id}`}><Edit className="w-3.5 h-3.5 mr-1" /> Edit</Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2">
                              <p>This action cannot be undone. This will:</p>
                              <ul className="list-disc list-inside text-sm text-left pl-4 space-y-1">
                                <li>Attempt to archive the project's Product and Price, and deactivate its Payment Link in Stripe.</li>
                                <li>Permanently delete the project "{project.title}" from the Marpu database.</li>
                                <li>Remove the project from being publicly visible on the website.</li>
                              </ul>
                              <p className="pt-2">Please confirm you understand these consequences.</p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProject(project._id?.toString())}>
                              Yes, Delete Project
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DonationProjectsLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-xl text-foreground/80">Loading donation projects...</p>
    </div>
  );
}

export default function ManageDonationProjectsPage() {
  return (
    <Suspense fallback={<DonationProjectsLoadingSkeleton />}>
      <ManageDonationProjectsPageComponent />
    </Suspense>
  );
}
