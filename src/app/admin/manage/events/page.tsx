
'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, PlusCircle, Edit, Trash2, Archive, ArchiveRestore, ArrowLeft, CalendarDays, PlayCircle, CheckCircle, History } from 'lucide-react';
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
import type { Event } from '@/types/db';
import { Badge } from '@/components/ui/badge'; 

const processMongoId = (item: any) => ({ ...item, _id: item._id?.toString(), isArchived: item.isArchived || false });

type FilterType = 'all' | 'upcoming' | 'past' | 'archived';

interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  archivedEvents: number;
}

function ManageEventsPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>( (searchParams.get('filter') as FilterType) || 'all');
  const [updatingArchiveStatus, setUpdatingArchiveStatus] = useState<string | null>(null);
  const [eventCounts, setEventCounts] = useState<EventStats | null>(null);


  const fetchPageData = useCallback(async (filter: FilterType) => {
    setLoading(true);
    setError(null);
    try {
      const [eventsResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/manage/events?filter=${filter}`),
        fetch('/api/admin/stats')
      ]);

      if (!eventsResponse.ok) {
        const errorData = await eventsResponse.json();
        throw new Error(errorData.error || `Failed to fetch events: ${eventsResponse.statusText}`);
      }
      const eventsData = (await eventsResponse.json()).map(processMongoId);
      setEvents(eventsData);

      if (!statsResponse.ok) {
         console.warn(`Failed to fetch stats for counts: ${statsResponse.statusText}`);
         setEventCounts(null); 
      } else {
        const statsData = await statsResponse.json();
        setEventCounts({
            totalEvents: statsData.totalEvents, 
            upcomingEvents: statsData.upcomingEvents,
            pastEvents: statsData.pastEvents,
            archivedEvents: statsData.archivedEvents,
        });
      }

    } catch (err) {
      console.error('Failed to fetch events or stats:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      toast({
        title: "Error Fetching Data",
        description: err instanceof Error ? err.message : 'Could not load events or counts.',
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
    router.push(`/admin/manage/events?filter=${newFilter}`, { scroll: false });
  };

  const handleDeleteEvent = async (eventId: string | undefined) => {
    if (!eventId) {
      toast({ title: "Error", description: "Event ID is missing.", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }
      toast({ title: "Success", description: "Event deleted successfully." });
      fetchPageData(activeFilter); 
    } catch (err) {
      console.error('Failed to delete event:', err);
      toast({
        title: "Error Deleting Event",
        description: err instanceof Error ? err.message : 'Could not delete event.',
        variant: "destructive",
      });
    }
  };

  const handleToggleArchiveStatus = async (event: Event) => {
    if (!event._id) return;
    setUpdatingArchiveStatus(event._id.toString());
    try {
        const newArchivedStatus = !event.isArchived;
        const response = await fetch(`/api/admin/events/${event._id.toString()}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isArchived: newArchivedStatus }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to ${newArchivedStatus ? 'archive' : 'unarchive'} event`);
        }
        toast({
            title: "Success",
            description: `Event ${newArchivedStatus ? 'archived' : 'unarchived'} successfully.`,
        });
        fetchPageData(activeFilter); 
    } catch (err) {
        toast({
            title: "Error",
            description: err instanceof Error ? err.message : 'Could not update event archive status.',
            variant: "destructive",
        });
    } finally {
        setUpdatingArchiveStatus(null);
    }
  };


  if (loading && events.length === 0) { 
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xl text-foreground/80">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Events</h1>
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
          <CalendarDays className="w-8 h-8 mr-3 text-accent" /> Manage All Events
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
            key="all"
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('all')}
        >
            All Active ({eventCounts?.totalEvents || 0})
        </Button>
        <Button
            key="upcoming"
            variant={activeFilter === 'upcoming' ? 'default' : 'outline'}
             size="sm"
            onClick={() => handleFilterChange('upcoming')}
        >
            Upcoming ({eventCounts?.upcomingEvents || 0})
        </Button>
        <Button
            key="past"
            variant={activeFilter === 'past' ? 'default' : 'outline'}
             size="sm"
            onClick={() => handleFilterChange('past')}
        >
            Past ({eventCounts?.pastEvents || 0})
        </Button>
        <Button
            key="archived"
            variant={activeFilter === 'archived' ? 'default' : 'outline'}
             size="sm"
            onClick={() => handleFilterChange('archived')}
        >
            Archived ({eventCounts?.archivedEvents || 0})
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-headline text-primary">Events List ({loading ? <Loader2 className="inline w-4 h-4 animate-spin" /> : events.length})</CardTitle>
          <Button asChild size="sm">
            <Link href="/admin/events/new"><PlusCircle className="w-4 h-4 mr-2" /> Add New Event</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading && events.length === 0 ? (
             <div className="text-center py-8"><Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" /><p className="mt-2 text-foreground/70">Loading...</p></div>
          ) : events.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Time</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const eventDate = new Date(event.date);
                  const now = new Date();
                  const isToday = eventDate.toDateString() === now.toDateString();
                  const isPastEvent = eventDate < now && !isToday;
                  
                  let statusBadge;
                  if (event.isArchived) {
                    statusBadge = <Badge variant="outline" className="border-slate-500 text-slate-600 text-xs">Archived</Badge>;
                  } else if (isToday) {
                    statusBadge = <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white text-xs"><PlayCircle className="w-3 h-3 mr-1 inline"/>Ongoing</Badge>;
                  } else if (isPastEvent) {
                    statusBadge = <Badge variant="secondary" className="text-xs"><History className="w-3 h-3 mr-1 inline"/>Past</Badge>;
                  } else {
                    statusBadge = <Badge variant="default" className="bg-green-500/80 hover:bg-green-600/90 text-white text-xs"><CheckCircle className="w-3 h-3 mr-1 inline"/>Upcoming</Badge>;
                  }

                  return (
                    <TableRow key={event._id} className={event.isArchived ? "opacity-60" : ""}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell className="hidden sm:table-cell">{eventDate.toLocaleDateString()}</TableCell>
                      <TableCell className="hidden md:table-cell">{event.time}</TableCell>
                      <TableCell className="hidden lg:table-cell">{event.location}</TableCell>
                      <TableCell>{statusBadge}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/events/edit/${event._id}`}><Edit className="w-3 h-3 mr-1" /> Edit</Link>
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleToggleArchiveStatus(event)}
                            disabled={updatingArchiveStatus === event._id?.toString()}
                        >
                            {updatingArchiveStatus === event._id?.toString() ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : (event.isArchived ? <ArchiveRestore className="w-3 h-3 mr-1" /> : <Archive className="w-3 h-3 mr-1" />)}
                            {event.isArchived ? 'Unarchive' : 'Archive'}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"><Trash2 className="w-3.5 h-3.5" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the event "{event.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteEvent(event._id?.toString())}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-foreground/70 mb-4">No events found matching the current filter. Try adding some or re-seeding your database if you expect sample data.</p>
              {activeFilter !== 'archived' && (
                <Button asChild>
                    <Link href="/admin/events/new"><PlusCircle className="w-4 h-4 mr-2" /> Add Your First Event</Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EventsLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-xl text-foreground/80">Loading events...</p>
    </div>
  );
}

export default function ManageEventsPage() {
  return (
    <Suspense fallback={<EventsLoadingSkeleton />}>
      <ManageEventsPageComponent />
    </Suspense>
  );
}
