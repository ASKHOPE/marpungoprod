
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, PlusCircle, Edit, Trash2, ArrowLeft, HandHeart } from 'lucide-react';
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
import type { VolunteerOpportunity } from '@/types/db';

const processMongoId = (item: any) => ({ ...item, _id: item._id?.toString() });

export default function ManageVolunteerOpportunitiesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllOpportunities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/manage/volunteer-opportunities');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch opportunities: ${response.statusText}`);
      }
      const data = (await response.json()).map(processMongoId);
      setOpportunities(data);
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      toast({
        title: "Error Fetching Opportunities",
        description: err instanceof Error ? err.message : 'Could not load opportunities data.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllOpportunities();
  }, [fetchAllOpportunities]);

  const handleDeleteOpportunity = async (opportunityId: string | undefined) => {
    if (!opportunityId) {
      toast({ title: "Error", description: "Opportunity ID is missing.", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`/api/admin/volunteer-opportunities/${opportunityId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete volunteer opportunity');
      }
      toast({ title: "Success", description: "Volunteer opportunity deleted successfully." });
      fetchAllOpportunities(); 
    } catch (err) {
      console.error('Failed to delete volunteer opportunity:', err);
      toast({
        title: "Error Deleting Opportunity",
        description: err instanceof Error ? err.message : 'Could not delete volunteer opportunity.',
        variant: "destructive",
      });
    }
  };

  if (loading) {
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
        <Button onClick={fetchAllOpportunities} variant="outline">Try Again</Button>
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
          <HandHeart className="w-8 h-8 mr-3 text-accent" /> Manage All Volunteer Opportunities
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-headline text-primary">Opportunities List ({opportunities.length})</CardTitle>
          <Button asChild size="sm">
            <Link href="/admin/volunteer-opportunities/new"><PlusCircle className="w-4 h-4 mr-2" /> Add New Opportunity</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {opportunities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Location</TableHead>
                  <TableHead className="hidden md:table-cell">Commitment</TableHead>
                  <TableHead className="hidden lg:table-cell">Skills</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.map((opp) => (
                  <TableRow key={opp._id}>
                    <TableCell className="font-medium">{opp.title}</TableCell>
                    <TableCell className="hidden sm:table-cell">{opp.location}</TableCell>
                    <TableCell className="hidden md:table-cell">{opp.commitment}</TableCell>
                    <TableCell className="hidden lg:table-cell">{opp.skills}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/volunteer-opportunities/edit/${opp._id}`}><Edit className="w-3.5 h-3.5 mr-1" /> Edit</Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the volunteer opportunity "{opp.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteOpportunity(opp._id?.toString())}>
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
             <div className="text-center py-8">
              <p className="text-foreground/70 mb-4">No volunteer opportunities found. Try adding some or re-seeding your database.</p>
              <Button asChild>
                <Link href="/admin/volunteer-opportunities/new"><PlusCircle className="w-4 h-4 mr-2" /> Add Your First Opportunity</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
    
