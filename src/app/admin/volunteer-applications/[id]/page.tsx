
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle, ArrowLeft, User, Mail, Phone, Calendar, Sparkles, MessageSquare, Info, Save } from 'lucide-react';
import type { VolunteerApplication } from '@/types/db';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const applicationStatuses: VolunteerApplication['status'][] = ['pending', 'reviewed', 'accepted', 'rejected'];

export default function ViewVolunteerApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<VolunteerApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentStatus, setCurrentStatus] = useState<VolunteerApplication['status']>('pending');
  const [adminNotes, setAdminNotes] = useState<string>('');

  const fetchApplication = useCallback(async () => {
    if (applicationId) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/volunteer-applications/${applicationId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch application: ${response.statusText}`);
        }
        const data: VolunteerApplication = await response.json();
        setApplication(data);
        setCurrentStatus(data.status || 'pending');
        setAdminNotes(data.notes || '');
      } catch (err) {
        console.error('Failed to fetch application:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [applicationId]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleUpdateApplication = async () => {
    if (!application || !application._id) return;
    setIsUpdating(true);
    try {
      const updates: Partial<Pick<VolunteerApplication, 'status' | 'notes'>> = {
        status: currentStatus,
        notes: adminNotes,
      };
      const response = await fetch(`/api/admin/volunteer-applications/${application._id.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update application');
      }
      const result = await response.json();
      setApplication(prev => prev ? { ...prev, ...result.updatedApplication } : null);
      toast({
        title: "Success",
        description: `Application updated. Status: ${currentStatus}. Notes saved.`,
      });
    } catch (err) {
      console.error('Failed to update application:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not update application.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xl text-foreground/80">Loading application details...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Application</h1>
        <p className="text-foreground/80 mb-8">{error || 'Application data could not be found.'}</p>
        <Button asChild variant="outline">
          <Link href="/admin/manage/volunteer-applications">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Applications
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/manage/volunteer-applications">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Applications
          </Link>
        </Button>
      </div>
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <User className="mr-3 h-6 w-6 text-accent" /> 
              Application: {application.firstName} {application.lastName}
            </CardTitle>
            <Badge 
              variant={currentStatus === 'accepted' ? 'default' : currentStatus === 'pending' ? 'outline' : 'secondary'}
              className={
                currentStatus === 'accepted' ? 'bg-green-600 hover:bg-green-700 text-white' :
                currentStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700 text-white' :
                currentStatus === 'reviewed' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                'border-yellow-500 text-yellow-600' // pending
              }
            >
              {currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) : 'Pending'}
            </Badge>
          </div>
          <CardDescription>Opportunity: {application.opportunityTitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Full Name</Label>
                <p className="text-foreground/90">{application.firstName} {application.lastName}</p>
            </div>
            <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Email</Label>
                <a href={`mailto:${application.email}`} className="text-accent hover:underline block">{application.email}</a>
            </div>
            <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Phone</Label>
                <p className="text-foreground/90">{application.phone || 'N/A'}</p>
            </div>
            <div className="space-y-1">
                <Label className="text-sm text-muted-foreground">Submitted</Label>
                <p className="text-foreground/90">{new Date(application.submittedAt).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground flex items-center"><Sparkles className="w-4 h-4 mr-2 text-accent"/>Reason for Interest</Label>
            <p className="text-foreground/80 whitespace-pre-wrap bg-muted/30 p-3 rounded-md">{application.interestReason}</p>
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground flex items-center"><MessageSquare className="w-4 h-4 mr-2 text-accent"/>Skills/Experience</Label>
            <p className="text-foreground/80 whitespace-pre-wrap bg-muted/30 p-3 rounded-md">{application.skills || 'N/A'}</p>
          </div>
          
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground flex items-center"><Calendar className="w-4 h-4 mr-2 text-accent"/>Availability</Label>
            <p className="text-foreground/80 whitespace-pre-wrap bg-muted/30 p-3 rounded-md">{application.availability || 'N/A'}</p>
          </div>

          <hr className="my-6"/>

          <div className="space-y-3">
            <Label htmlFor="status" className="text-lg font-medium text-primary">Update Application Status</Label>
            <Select value={currentStatus} onValueChange={(value) => setCurrentStatus(value as VolunteerApplication['status'])}>
              <SelectTrigger id="status" className="w-full md:w-[280px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {applicationStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="adminNotes" className="text-lg font-medium text-primary flex items-center">
                <Info className="w-5 h-5 mr-2 text-accent" /> Admin Notes (Internal)
            </Label>
            <Textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes about this application..."
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button onClick={handleUpdateApplication} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    