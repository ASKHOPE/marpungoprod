
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
    Loader2, AlertTriangle, Users, CalendarDays, MessageSquare, UserPlus, HandHeart, PlusCircle, 
    Edit, Trash2, Eye, Settings, ArrowUpRight, CheckCircle, CircleDollarSign, 
    Archive, Package, History, PlayCircle, Activity, Clock, XCircle, FileText, ShieldAlert, Filter, EyeOff, UserCog
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import type { Event, VolunteerOpportunity, ContactMessage, EventRegistration, VolunteerApplication, Project, UserDocument } from '@/types/db';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Stats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  archivedEvents: number;
  totalOpportunities: number;
  totalMessages: number;
  unreadMessages: number;
  archivedMessages: number;
  spamMessages: number;
  totalRegistrations: number;
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  reviewedApplications: number;
  rejectedApplications: number;
  totalProjects: number;
  activeProjects: number;
  fundedProjects: number;
  archivedProjects: number;
  totalUsers: number; // Added for user count
}

const processMongoId = (item: any) => ({ ...item, _id: item._id?.toString() });


interface ManagementCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    link: string;
    linkText: string;
    statsDetails?: Array<{ label: string; value: number | string | undefined; icon?: React.ElementType; link?: string }>;
}

const ManagementCard: React.FC<ManagementCardProps> = ({ title, description, icon: Icon, link, linkText, statsDetails }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center mb-2">
          <Icon className="h-6 w-6 text-accent mr-2.5" />
          <CardTitle className="text-lg font-headline text-primary">{title}</CardTitle>
        </div>
        <CardDescription className="text-sm text-foreground/70 flex-grow min-h-[30px]">{description}</CardDescription>
      </CardHeader>
      {statsDetails && statsDetails.length > 0 && (
        <CardContent className="pt-0 pb-3 flex-grow">
          <div className="space-y-1.5 text-sm">
            {statsDetails.map(stat => (
              stat.value !== undefined && (
                <div key={stat.label} className="flex items-center text-foreground/80">
                  {stat.icon && <stat.icon className="w-4 h-4 mr-2 text-muted-foreground flex-shrink-0" />}
                  <span className="font-medium w-24 shrink-0">{stat.label}:</span>
                  {stat.link ? (
                    <Link href={stat.link} className="ml-1 font-semibold text-accent hover:underline">{stat.value}</Link>
                  ) : (
                    <span className="ml-1 font-semibold text-primary">{stat.value}</span>
                  )}
                </div>
              )
            ))}
          </div>
        </CardContent>
      )}
      <CardFooter>
        <Button asChild className="w-full" size="sm">
          <Link href={link}>{linkText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );


export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState<Stats | null>(null);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [recentOpportunities, setRecentOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [recentApplications, setRecentApplications] = useState<VolunteerApplication[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        statsRes,
        eventsRes,
        opportunitiesRes,
        messagesRes,
        registrationsRes,
        applicationsRes,
      ] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/recent-events'),
        fetch('/api/admin/recent-volunteer-opportunities'),
        fetch('/api/admin/recent-contact-messages'),
        fetch('/api/admin/recent-event-registrations'),
        fetch('/api/admin/recent-volunteer-applications'),
      ]);

      const checkOk = (res: Response, name: string) => {
        if (!res.ok) throw new Error(`Failed to fetch ${name}: ${res.status} ${res.statusText}`);
        return res.json();
      }
      
      const statsData = await checkOk(statsRes, 'stats');
      setStats(statsData);

      const eventsData = (await checkOk(eventsRes, 'events')).map(item => processMongoId({...item, isArchived: item.isArchived || false}));
      setRecentEvents(eventsData);

      const opportunitiesData = (await checkOk(opportunitiesRes, 'opportunities')).map(processMongoId);
      setRecentOpportunities(opportunitiesData);
      
      const messagesData = (await checkOk(messagesRes, 'messages')).map(item => processMongoId({...item, isRead: item.isRead || false, status: item.status || 'active'}));
      setRecentMessages(messagesData);

      const applicationsData = (await checkOk(applicationsRes, 'applications')).map(item => processMongoId({...item, status: item.status || 'pending'}));
      setRecentApplications(applicationsData);

    } catch (err) {
      console.error('AdminDashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching dashboard data.');
      toast({
        title: "Error Fetching Data",
        description: err instanceof Error ? err.message : 'Could not load dashboard data.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteEvent = async (eventId: string | undefined) => {
    if (!eventId) {
      toast({ title: "Error", description: "Event ID is missing.", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete event');
      }
      toast({ title: "Success", description: "Event deleted successfully." });
      fetchData(); 
    } catch (err) {
      toast({
        title: "Error Deleting Event",
        description: err instanceof Error ? err.message : 'Could not delete event.',
        variant: "destructive",
      });
    }
  };

  const handleDeleteOpportunity = async (opportunityId: string | undefined) => {
    if (!opportunityId) {
      toast({ title: "Error", description: "Opportunity ID is missing.", variant: "destructive" });
      return;
    }
    try {
      const response = await fetch(`/api/admin/volunteer-opportunities/${opportunityId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete volunteer opportunity');
      }
      toast({ title: "Success", description: "Volunteer opportunity deleted successfully." });
      fetchData(); 
    } catch (err) {
      toast({
        title: "Error Deleting Opportunity",
        description: err instanceof Error ? err.message : 'Could not delete volunteer opportunity.',
        variant: "destructive",
      });
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="ml-4 text-xl text-foreground/80">Loading Dashboard Data...</p>
      </div>
    );
  }

  if (error && !stats) { 
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Dashboard</h1>
        <p className="text-foreground/80 mb-8">{error}</p>
        <Button onClick={fetchData} variant="outline">Try Again</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-headline font-bold text-primary">Admin Dashboard</h1>

      {error && stats && ( 
        <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm">
          <AlertTriangle className="inline w-4 h-4 mr-2" /> Some dashboard data failed to load: {error}
        </div>
      )}

      <section>
        <h2 className="text-2xl font-headline font-semibold text-primary mb-4">Management Panels</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ManagementCard 
            title="Events Management"
            description="View all, add, edit, or delete community events and workshops."
            icon={CalendarDays}
            link="/admin/manage/events"
            linkText="Manage All Events"
            statsDetails={[
                { label: "Active", value: stats?.totalEvents, icon: Activity, link: "/admin/manage/events?filter=all" },
                { label: "Upcoming", value: stats?.upcomingEvents, icon: ArrowUpRight, link: "/admin/manage/events?filter=upcoming" },
                { label: "Past", value: stats?.pastEvents, icon: History, link: "/admin/manage/events?filter=past" },
                { label: "Archived", value: stats?.archivedEvents, icon: Archive, link: "/admin/manage/events?filter=archived" }
            ]}
          />
          <ManagementCard 
            title="Volunteer Opportunities"
            description="Create, update, and manage all volunteer roles and opportunities."
            icon={HandHeart}
            link="/admin/manage/volunteer-opportunities"
            linkText="Manage All Opportunities"
             statsDetails={[
                { label: "Total Ops", value: stats?.totalOpportunities, icon: Users, link: "/admin/manage/volunteer-opportunities" },
            ]}
          />
          <ManagementCard 
            title="Contact Submissions"
            description="View all messages from users and potential partners."
            icon={MessageSquare}
            link="/admin/manage/contact-messages"
            linkText="View All Messages"
            statsDetails={[
                { label: "Active", value: stats?.totalMessages, icon: FileText, link: "/admin/manage/contact-messages?filter=all" },
                { label: "Unread", value: stats?.unreadMessages, icon: EyeOff, link: "/admin/manage/contact-messages?filter=unread" },
                { label: "Archived", value: stats?.archivedMessages, icon: Archive, link: "/admin/manage/contact-messages?filter=archived" },
                { label: "Spam", value: stats?.spamMessages, icon: ShieldAlert, link: "/admin/manage/contact-messages?filter=spam" }
            ]}
          />
           <ManagementCard 
            title="Volunteer Applications"
            description="Review and manage applications for volunteer roles."
            icon={UserPlus} 
            link="/admin/manage/volunteer-applications" 
            linkText="Manage Applications"
            statsDetails={[
                { label: "Total Apps", value: stats?.totalApplications, icon: Users, link: "/admin/manage/volunteer-applications" },
                { label: "Pending", value: stats?.pendingApplications, icon: Clock, link: "/admin/manage/volunteer-applications?filter=pending" },
                { label: "Accepted", value: stats?.acceptedApplications, icon: CheckCircle, link: "/admin/manage/volunteer-applications?filter=accepted" },
                { label: "Reviewed", value: stats?.reviewedApplications, icon: Eye, link: "/admin/manage/volunteer-applications?filter=reviewed" },
                { label: "Rejected", value: stats?.rejectedApplications, icon: XCircle, link: "/admin/manage/volunteer-applications?filter=rejected" }
            ]}
          />
           <ManagementCard 
            title="Donation Projects"
            description="Manage donation projects and track funding."
            icon={Package}
            link="/admin/manage/donation-projects" 
            linkText="Manage Donation Projects"
            statsDetails={[
                { label: "Total", value: stats?.totalProjects, icon: Package, link: "/admin/manage/donation-projects?filter=all" },
                { label: "Active", value: stats?.activeProjects, icon: Activity, link: "/admin/manage/donation-projects?filter=active" },
                { label: "Funded", value: stats?.fundedProjects, icon: CircleDollarSign, link: "/admin/manage/donation-projects?filter=funded" },
                { label: "Archived", value: stats?.archivedProjects, icon: Archive, link: "/admin/manage/donation-projects?filter=archived" },
            ]}
          />
           <ManagementCard 
            title="User Management"
            description="Oversee user accounts, roles, and permissions."
            icon={UserCog}
            link="/admin/manage/users" 
            linkText="Manage Users"
            statsDetails={[
              {label: "Total Users", value: stats?.totalUsers, icon: Users, link: "/admin/manage/users"}
            ]}
          />
        </div>
      </section>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl font-headline text-primary">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="events">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
                    <TabsTrigger value="events">Events ({stats?.totalEvents ?? 0})</TabsTrigger>
                    <TabsTrigger value="opportunities">Opportunities ({stats?.totalOpportunities ?? 0})</TabsTrigger>
                    <TabsTrigger value="messages">Messages ({stats?.totalMessages ?? 0})</TabsTrigger>
                    <TabsTrigger value="applications">Applications ({stats?.totalApplications ?? 0})</TabsTrigger>
                </TabsList>
                <TabsContent value="events">
                    {recentEvents.filter(event => !event.isArchived).length > 0 ? (
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead className="px-3 py-2 h-10 text-xs">Title</TableHead>
                                <TableHead className="px-3 py-2 h-10 text-xs">Date</TableHead>
                                <TableHead className="px-3 py-2 h-10 text-xs hidden sm:table-cell">Location</TableHead>
                                <TableHead className="px-3 py-2 h-10 text-xs">Status</TableHead>
                                <TableHead className="text-right px-3 py-2 h-10 text-xs">Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {recentEvents.filter(event => !event.isArchived).slice(0,3).map((event) => (
                                <TableRow key={event._id}>
                                <TableCell className="font-medium px-3 py-2 text-sm">{event.title}</TableCell>
                                <TableCell className="px-3 py-2 text-sm">{event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell className="px-3 py-2 text-sm hidden sm:table-cell">{event.location}</TableCell>
                                <TableCell className="px-3 py-2 text-sm">
                                    {
                                    event.date && new Date(event.date) < new Date() && new Date(event.date).toDateString() !== new Date().toDateString() ? <Badge variant="secondary"><History className="w-3 h-3 mr-1"/>Past</Badge> : 
                                    event.date && new Date(event.date).toDateString() === new Date().toDateString() ? <Badge className="bg-blue-500 text-white"><PlayCircle className="w-3 h-3 mr-1"/>Ongoing</Badge> :
                                    <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1"/>Upcoming</Badge>
                                    }
                                </TableCell>
                                <TableCell className="text-right space-x-1 px-3 py-2 text-sm">
                                    <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/events/edit/${event._id}`}><Edit className="w-3.5 h-3.5 mr-1" /> Edit</Link>
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
                            ))}
                            </TableBody>
                        </Table>
                    ) : <p className="text-foreground/70 text-sm p-3 text-center">No recent (non-archived) events found.</p>}
                    {recentEvents.filter(event => !event.isArchived).length > 3 && (
                        <div className="text-center mt-4">
                            <Button variant="outline" size="sm" asChild><Link href="/admin/manage/events">View All Events</Link></Button>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="opportunities">
                    {recentOpportunities.length > 0 ? (
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead className="px-3 py-2 h-10 text-xs">Title</TableHead>
                                <TableHead className="px-3 py-2 h-10 text-xs hidden sm:table-cell">Location</TableHead>
                                <TableHead className="px-3 py-2 h-10 text-xs">Commitment</TableHead>
                                <TableHead className="text-right px-3 py-2 h-10 text-xs">Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {recentOpportunities.slice(0,3).map((opp) => (
                                <TableRow key={opp._id}>
                                <TableCell className="font-medium px-3 py-2 text-sm">{opp.title}</TableCell>
                                <TableCell className="px-3 py-2 text-sm hidden sm:table-cell">{opp.location}</TableCell>
                                <TableCell className="px-3 py-2 text-sm">{opp.commitment}</TableCell>
                                <TableCell className="text-right space-x-1 px-3 py-2 text-sm">
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
                    ) : <p className="text-foreground/70 text-sm p-3 text-center">No recent volunteer opportunities found.</p>}
                    {recentOpportunities.length > 3 && (
                        <div className="text-center mt-4">
                            <Button variant="outline" size="sm" asChild><Link href="/admin/manage/volunteer-opportunities">View All Opportunities</Link></Button>
                        </div>
                    )}
                </TabsContent>
                 <TabsContent value="messages">
                    {recentMessages.filter(msg => msg.status === 'active').length > 0 ? ( 
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="px-3 py-2 h-10 text-xs">Status</TableHead>
                        <TableHead className="px-3 py-2 h-10 text-xs">From</TableHead>
                        <TableHead className="px-3 py-2 h-10 text-xs">Subject</TableHead>
                        <TableHead className="text-right px-3 py-2 h-10 text-xs">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentMessages.filter(msg => msg.status === 'active').slice(0,3).map((msg) => (
                        <TableRow key={msg._id} className={!msg.isRead ? 'font-semibold bg-accent/5 hover:bg-accent/10' : ''}>
                            <TableCell className="px-3 py-2 text-sm">
                                {!msg.isRead ? (
                                    <Badge variant="default" className="bg-accent text-accent-foreground text-xs">Unread</Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-xs">Read</Badge>
                                )}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-sm">{msg.firstName} {msg.lastName}</TableCell>
                            <TableCell className="font-medium px-3 py-2 text-sm">{msg.subject}</TableCell>
                            <TableCell className="text-right px-3 py-2 text-sm">
                                <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/contact-messages/${msg._id}`}><Eye className="w-3.5 h-3.5 mr-1" /> View</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                    ) : <p className="text-foreground/70 text-sm p-3 text-center">No recent active contact messages.</p>}
                     {recentMessages.filter(msg => msg.status === 'active').length > 3 && (
                        <div className="text-center mt-4">
                            <Button variant="outline" size="sm" asChild><Link href="/admin/manage/contact-messages">View All Messages</Link></Button>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="applications">
                     {recentApplications.length > 0 ? (
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="px-3 py-2 h-10 text-xs">Opportunity</TableHead>
                        <TableHead className="px-3 py-2 h-10 text-xs">Applicant</TableHead>
                        <TableHead className="px-3 py-2 h-10 text-xs">Status</TableHead>
                        <TableHead className="text-right px-3 py-2 h-10 text-xs">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentApplications.slice(0,3).map((app) => (
                        <TableRow key={app._id}>
                            <TableCell className="font-medium px-3 py-2 text-sm">{app.opportunityTitle}</TableCell>
                            <TableCell className="px-3 py-2 text-sm">{app.firstName} {app.lastName}</TableCell>
                            <TableCell className="px-3 py-2 text-sm">
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
                            <TableCell className="text-right space-x-1 px-3 py-2 text-sm">
                                <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/volunteer-applications/${app._id}`}><Eye className="w-3.5 h-3.5 mr-1" /> View</Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                    ): <p className="text-foreground/70 text-sm p-3 text-center">No recent volunteer applications.</p>}
                     {recentApplications.length > 3 && (
                        <div className="text-center mt-4">
                            <Button variant="outline" size="sm" asChild><Link href="/admin/manage/volunteer-applications">View All Applications</Link></Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
    
