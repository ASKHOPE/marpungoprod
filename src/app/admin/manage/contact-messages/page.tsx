
'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Eye, ArrowLeft, MessageSquare, CheckCircle, Circle, Archive, ShieldAlert, Trash2 } from 'lucide-react';
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
import type { ContactMessage } from '@/types/db';
import { Badge } from '@/components/ui/badge';

const processMongoId = (item: any) => ({ ...item, _id: item._id?.toString() });

type FilterType = 'all' | 'unread' | 'read' | 'archived' | 'spam' | 'active';

interface MessageStats {
  totalActive: number;
  unread: number;
  read: number;
  archived: number;
  spam: number;
  all: number;
}

function ManageContactMessagesPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>( (searchParams.get('filter') as FilterType) || 'all');
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);
  const [messageCounts, setMessageCounts] = useState<MessageStats | null>(null);

  const fetchPageData = useCallback(async (filter: FilterType) => {
    setLoading(true);
    setError(null);
    try {
      const [messagesResponse, statsResponse] = await Promise.all([
        fetch(`/api/admin/manage/contact-messages?filter=${filter}`),
        fetch('/api/admin/stats')
      ]);
      
      if (!messagesResponse.ok) {
        const errorData = await messagesResponse.json();
        throw new Error(errorData.error || `Failed to fetch messages: ${messagesResponse.statusText}`);
      }
      const data = (await messagesResponse.json()).map(item => processMongoId({...item, isRead: item.isRead || false, status: item.status || 'active'}));
      setMessages(data);

      if (!statsResponse.ok) {
        console.warn(`Failed to fetch stats for counts: ${statsResponse.statusText}`);
        setMessageCounts(null);
      } else {
        const statsData = await statsResponse.json();
        setMessageCounts({
            totalActive: statsData.totalMessages,
            unread: statsData.unreadMessages,
            read: statsData.totalMessages - statsData.unreadMessages, 
            archived: statsData.archivedMessages,
            spam: statsData.spamMessages,
            all: statsData.totalMessages + statsData.archivedMessages + statsData.spamMessages 
        });
      }

    } catch (err) {
      console.error('Failed to fetch messages or stats:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      toast({
        title: "Error Fetching Data",
        description: err instanceof Error ? err.message : 'Could not load messages data or counts.',
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
    router.push(`/admin/manage/contact-messages?filter=${newFilter}`, { scroll: false });
  };

  const handleStatusUpdate = async (messageId: string, updates: Partial<Pick<ContactMessage, 'isRead' | 'status'>>) => {
    setUpdatingMessageId(messageId);
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update message');
      }
      toast({
        title: "Success",
        description: `Message updated.`,
      });
      fetchPageData(activeFilter); 
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not update message.",
        variant: "destructive",
      });
    } finally {
      setUpdatingMessageId(null);
    }
  };

  const handleDeleteMessage = async (messageId: string | undefined) => {
    if (!messageId) return;
    setUpdatingMessageId(messageId);
    try {
      const response = await fetch(`/api/admin/contact-messages/${messageId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete message');
      }
      toast({ title: "Success", description: "Message deleted successfully." });
      fetchPageData(activeFilter);
    } catch (err) {
      toast({
        title: "Error Deleting Message",
        description: err instanceof Error ? err.message : 'Could not delete message.',
        variant: "destructive",
      });
    } finally {
      setUpdatingMessageId(null);
    }
  };


  if (loading && messages.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xl text-foreground/80">Loading contact messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Messages</h1>
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
          <MessageSquare className="w-8 h-8 mr-3 text-accent" /> Manage All Contact Messages
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
            key="all-filter" 
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('all')}
        >
            All ({messageCounts?.all || 0})
        </Button>
         <Button
            key="active" 
            variant={activeFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('active')} 
        >
            Active ({messageCounts?.totalActive || 0})
        </Button>
        <Button
            key="unread"
            variant={activeFilter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('unread')}
        >
            Unread ({messageCounts?.unread || 0})
        </Button>
        <Button
            key="read"
            variant={activeFilter === 'read' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('read')}
        >
            Read ({messageCounts?.read || 0})
        </Button>
        <Button
            key="archived"
            variant={activeFilter === 'archived' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('archived')}
        >
            Archived ({messageCounts?.archived || 0})
        </Button>
        <Button
            key="spam"
            variant={activeFilter === 'spam' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('spam')}
        >
            Spam ({messageCounts?.spam || 0})
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">All Submitted Messages ({loading ? <Loader2 className="inline w-4 h-4 animate-spin" /> : messages.length})</CardTitle>
        </CardHeader>
        <CardContent>
         {loading && messages.length === 0 ? (
             <div className="text-center py-8"><Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" /><p className="mt-2 text-foreground/70">Loading...</p></div>
          ) : messages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="hidden sm:table-cell">Date Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((msg) => (
                  <TableRow key={msg._id} className={!msg.isRead && msg.status === 'active' ? 'font-semibold bg-accent/5 hover:bg-accent/10' : ''}>
                    <TableCell>
                      {msg.status === 'spam' && <Badge variant="destructive" className="text-xs">Spam</Badge>}
                      {msg.status === 'archived' && <Badge variant="outline" className="border-slate-500 text-slate-600 text-xs">Archived</Badge>}
                      {msg.status === 'active' && (!msg.isRead ? (
                        <Badge variant="default" className="bg-accent text-accent-foreground text-xs">Unread</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Read</Badge>
                      ))}
                    </TableCell>
                    <TableCell>{msg.firstName} {msg.lastName}</TableCell>
                    <TableCell className="hidden md:table-cell">{msg.email}</TableCell>
                    <TableCell>{msg.subject}</TableCell>
                    <TableCell className="hidden sm:table-cell">{msg.submittedAt ? new Date(msg.submittedAt).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/contact-messages/${msg._id}`}><Eye className="w-4 h-4 mr-1" /> View</Link>
                      </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                            disabled={updatingMessageId === msg._id?.toString()}
                          >
                            {updatingMessageId === msg._id?.toString() ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the message: "{msg.subject}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteMessage(msg._id?.toString())}>
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
            <p className="text-center py-8 text-foreground/70">No contact messages found matching the current filter.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ContactMessagesLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-xl text-foreground/80">Loading contact messages...</p>
    </div>
  );
}

export default function ManageContactMessagesPage() {
  return (
    <Suspense fallback={<ContactMessagesLoadingSkeleton />}>
      <ManageContactMessagesPageComponent />
    </Suspense>
  );
}
