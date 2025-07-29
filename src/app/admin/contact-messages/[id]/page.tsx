
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, ArrowLeft, Mail, User, Calendar, MessageSquareIcon, Type, EyeOff, Eye, Archive, ArchiveRestore, Trash2, ShieldAlert } from 'lucide-react';
import type { ContactMessage } from '@/types/db';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
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

export default function ViewContactMessagePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const messageId = params.id as string;

  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessage = useCallback(async () => {
    if (messageId) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/admin/contact-messages/${messageId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch message: ${response.statusText}`);
        }
        const data: ContactMessage = await response.json();
        setMessage(data);
      } catch (err) {
        console.error('Failed to fetch message:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [messageId]);

  useEffect(() => {
    fetchMessage();
  }, [fetchMessage]);

  const handleStatusUpdate = async (updates: Partial<Pick<ContactMessage, 'isRead' | 'status'>>) => {
    if (!message || !message._id) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/contact-messages/${message._id.toString()}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update message');
      }
      const result = await response.json();
      setMessage(prev => prev ? { ...prev, ...result.updatedMessage } : null);
      toast({
        title: "Success",
        description: `Message updated. ${
            updates.isRead !== undefined ? (updates.isRead ? 'Marked as Read.' : 'Marked as Unread.') : ''
        } ${
            updates.status ? `Status set to ${updates.status}.` : ''
        }`,
      });
    } catch (err) {
      console.error('Failed to update message:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not update message.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!message || !message._id) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/contact-messages/${message._id.toString()}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete message');
      }
      toast({
        title: "Message Deleted",
        description: "The contact message has been permanently deleted.",
      });
      router.push('/admin/manage/contact-messages');
    } catch (err) {
      console.error('Failed to delete message:', err);
      toast({
        title: "Error Deleting Message",
        description: err instanceof Error ? err.message : "Could not delete the message.",
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
        <p className="text-xl text-foreground/80">Loading message details...</p>
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Message</h1>
        <p className="text-foreground/80 mb-8">{error || 'Message data could not be found.'}</p>
        <Button asChild variant="outline">
          <Link href="/admin/manage/contact-messages">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Messages
          </Link>
        </Button>
      </div>
    );
  }
  
  const currentStatus = message.status || 'active';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/manage/contact-messages">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Messages
          </Link>
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
              <Type className="mr-3 h-6 w-6 text-accent" /> 
              Subject: {message.subject}
            </CardTitle>
            <div className="flex items-center space-x-2">
                {currentStatus === 'archived' && <Badge variant="outline" className="border-slate-500 text-slate-600">Archived</Badge>}
                {currentStatus === 'spam' && <Badge variant="destructive">Spam</Badge>}
                {message.isRead ? (
                    <Badge variant="secondary">Read</Badge>
                ) : (
                    <Badge variant="default" className="bg-accent text-accent-foreground">Unread</Badge>
                )}
            </div>
          </div>
          <CardDescription>Details of the contact message.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center">
            <User className="mr-2 h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-foreground/90">From:</span>
            <span className="ml-2 text-foreground/80">{message.firstName} {message.lastName}</span>
          </div>
          <div className="flex items-center">
            <Mail className="mr-2 h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-foreground/90">Email:</span>
            <a href={`mailto:${message.email}`} className="ml-2 text-accent hover:underline">{message.email}</a>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
            <span className="font-medium text-foreground/90">Submitted:</span>
            <span className="ml-2 text-foreground/80">{new Date(message.submittedAt).toLocaleString()}</span>
          </div>
          <div className="pt-2">
            <div className="flex items-start">
                <MessageSquareIcon className="mr-2 h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                <span className="font-medium text-foreground/90">Message:</span>
            </div>
            <p className="ml-7 mt-1 text-foreground/80 whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
              {message.message}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex flex-wrap gap-2">
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStatusUpdate({ isRead: !message.isRead })}
                    disabled={isUpdating}
                >
                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (message.isRead ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />) }
                    {message.isRead ? 'Mark as Unread' : 'Mark as Read'}
                </Button>

                {currentStatus !== 'archived' && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusUpdate({ status: 'archived' })} disabled={isUpdating}>
                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />} Archive
                    </Button>
                )}
                {currentStatus === 'archived' && (
                     <Button variant="outline" size="sm" onClick={() => handleStatusUpdate({ status: 'active' })} disabled={isUpdating}>
                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArchiveRestore className="mr-2 h-4 w-4" />} Unarchive
                    </Button>
                )}

                {currentStatus !== 'spam' && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusUpdate({ status: 'spam' })} disabled={isUpdating} className="text-yellow-600 border-yellow-500 hover:bg-yellow-50 hover:text-yellow-700">
                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />} Mark as Spam
                    </Button>
                )}
                 {currentStatus === 'spam' && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusUpdate({ status: 'active' })} disabled={isUpdating}>
                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />} Not Spam
                    </Button>
                )}
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this message.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteMessage} disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}

    