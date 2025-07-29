
'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, ArrowLeft, Users, Eye, Filter, Trash2 } from 'lucide-react';
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
import type { VolunteerApplication } from '@/types/db';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const processMongoId = (item: any) => ({ ...item, _id: item._id?.toString() });

type FilterType = 'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected';

interface ApplicationStats {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  reviewedApplications: number;
  rejectedApplications: number;
}

function ManageVolunteerApplicationsPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>( (searchParams.get('filter') as FilterType) || 'all');
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);
  const [applicationCounts, setApplicationCounts] = useState<ApplicationStats | null>(null);


  const fetchPageData = useCallback(async (filter: FilterType) => {
    setLoading(true);
    setError(null);
    try {
      const [applicationsResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/manage/volunteer-applications?filter=${filter}`),
        fetch('/api/admin/stats')
      ]);

      if (!applicationsResponse.ok) {
        const errorData = await applicationsResponse.json();
        throw new Error(errorData.error || `Failed to fetch applications: ${applicationsResponse.statusText}`);
      }
      const data = (await applicationsResponse.json()).map(item => processMongoId({...item, status: item.status || 'pending'}));
      setApplications(data);

      if (!statsResponse.ok) {
        console.warn(`Failed to fetch stats for counts: ${statsResponse.statusText}`);
        setApplicationCounts(null);
      } else {
        const statsData = await statsResponse.json();
        setApplicationCounts({
            totalApplications: statsData.totalApplications,
            pendingApplications: statsData.pendingApplications,
            acceptedApplications: statsData.acceptedApplications,
            reviewedApplications: statsData.reviewedApplications,
            rejectedApplications: statsData.rejectedApplications,
        });
      }

    } catch (err) {
      console.error('Failed to fetch applications or stats:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      toast({
        title: "Error Fetching Data",
        description: err instanceof Error ? err.message : 'Could not load applications data or counts.',
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

  const handleFilterChange = (newFilter: FilterType) => {
    setActiveFilter(newFilter);
    router.push(`/admin/manage/volunteer-applications?filter=${newFilter}`, { scroll: false });
  };

  const handleDeleteApplication = async (applicationId: string | undefined) => {
    if (!applicationId) {
      toast({ title: "Error", description: "Application ID is missing.", variant: "destructive" });
      return;
    }
    setUpdatingApplicationId(applicationId);
    try {
      const response = await fetch(`/api/admin/volunteer-applications/${applicationId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete application');
      }
      toast({ title: "Success", description: "Volunteer application deleted successfully." });
      fetchPageData(activeFilter);
    } catch (err) {
      toast({
        title: "Error Deleting Application",
        description: err instanceof Error ? err.message : 'Could not delete application.',
        variant: "destructive",
      });
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  if (loading && applications.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xl text-foreground/80">Loading volunteer applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Applications</h1>
        <p className="text-foreground/80 mb-8">{error}</p>
        <Button onClick={() => fetchPageData(activeFilter)} variant="outline">Try Again</Button>
        <Button asChild variant="link" className="mt-4">
          <Link href="/admin/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
       <div className="flex justify-between items-center">
        <h1 className="text-3xl font-headline font-bold text-primary flex items-center">
          <Users className="w-8 h-8 mr-3 text-accent" /> Manage Volunteer Applications
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <Filter className="w-5 h-5 mr-2 text-muted-foreground" />
        <Button
            key="all"
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('all')}
        >
            All ({applicationCounts?.totalApplications || 0})
        </Button>
        <Button
            key="pending"
            variant={activeFilter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('pending')}
        >
            Pending ({applicationCounts?.pendingApplications || 0})
        </Button>
        <Button
            key="reviewed"
            variant={activeFilter === 'reviewed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('reviewed')}
        >
            Reviewed ({applicationCounts?.reviewedApplications || 0})
        </Button>
        <Button
            key="accepted"
            variant={activeFilter === 'accepted' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('accepted')}
        >
            Accepted ({applicationCounts?.acceptedApplications || 0})
        </Button>
        <Button
            key="rejected"
            variant={activeFilter === 'rejected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('rejected')}
        >
            Rejected ({applicationCounts?.rejectedApplications || 0})
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">All Submitted Applications ({loading ? <Loader2 className="inline w-4 h-4 animate-spin" /> : applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && applications.length === 0 ? (
             <div className="text-center py-8"><Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" /><p className="mt-2 text-foreground/70">Loading...</p></div>
          ) : applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app._id}>
                    <TableCell>{app.firstName} {app.lastName}</TableCell>
                    <TableCell className="hidden sm:table-cell">{app.email}</TableCell>
                    <TableCell>{app.opportunityTitle}</TableCell>
                    <TableCell>
                      <Badge variant={app.status === 'accepted' ? 'default' : app.status === 'pending' ? 'outline' : 'secondary'}
                             className={cn('text-xs',
                                app.status === 'accepted' ? 'bg-green-600 hover:bg-green-700 text-white' :
                                app.status === 'rejected' ? 'bg-red-600 hover:bg-red-700 text-white' :
                                app.status === 'reviewed' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                                'border-yellow-500 text-yellow-600' 
                             )}
                      >
                        {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/volunteer-applications/${app._id}`}><Eye className="w-3.5 h-3.5 mr-1" /> View</Link>
                      </Button>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                disabled={updatingApplicationId === app._id?.toString()}
                            >
                                {updatingApplicationId === app._id?.toString() ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Trash2 className="w-3.5 h-3.5" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the application from "{app.firstName} {app.lastName}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteApplication(app._id?.toString())}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-foreground/70">No volunteer applications found matching the current filter.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ApplicationsLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-xl text-foreground/80">Loading volunteer applications...</p>
    </div>
  );
}

export default function ManageVolunteerApplicationsPage() {
  return (
    <Suspense fallback={<ApplicationsLoadingSkeleton />}>
      <ManageVolunteerApplicationsPageComponent />
    </Suspense>
  );
}
