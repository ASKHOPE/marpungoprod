
'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Removed useSearchParams as it's not used here
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Edit, Trash2, ArrowLeft, Users, UserCog, ShieldCheck, ShieldAlert } from 'lucide-react';
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
import type { UserDocument } from '@/types/db'; // Assuming UserDocument is the correct type for users
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';

const processMongoId = (item: any) => ({ ...item, _id: item._id?.toString() });


function ManageUsersPageComponent() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  
  const [users, setUsers] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/manage/users');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch users: ${response.statusText}`);
      }
      const data = (await response.json()).map(processMongoId);
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      toast({
        title: "Error Fetching Users",
        description: err instanceof Error ? err.message : 'Could not load users data.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const handleDeleteUser = async (userIdToDelete: string | undefined) => {
    if (!userIdToDelete) {
      toast({ title: "Error", description: "User ID is missing.", variant: "destructive" });
      return;
    }
    if (session?.user?.id === userIdToDelete) {
        toast({ title: "Action Not Allowed", description: "You cannot delete your own account.", variant: "destructive"});
        return;
    }
    setDeletingUserId(userIdToDelete);
    try {
      const response = await fetch(`/api/admin/manage/users/${userIdToDelete}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      toast({ title: "Success", description: "User deleted successfully." });
      fetchAllUsers(); 
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast({
        title: "Error Deleting User",
        description: err instanceof Error ? err.message : 'Could not delete user.',
        variant: "destructive",
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xl text-foreground/80">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading Users</h1>
        <p className="text-foreground/80 mb-8">{error}</p>
        <Button onClick={fetchAllUsers} variant="outline">Try Again</Button>
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
          <UserCog className="w-8 h-8 mr-3 text-accent" /> Manage Users
        </h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-headline text-primary">All Registered Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                         {user.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5 mr-1.5"/> : <Users className="w-3.5 h-3.5 mr-1.5"/>}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/manage/users/edit/${user._id}`}><Edit className="w-3.5 h-3.5 mr-1" /> Edit</Link>
                      </Button>
                      {session?.user?.id !== user._id?.toString() && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                              disabled={deletingUserId === user._id?.toString()}
                            >
                              {deletingUserId === user._id?.toString() ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user "{user.name}" ({user.email}).
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={deletingUserId === user._id?.toString()}>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteUser(user._id?.toString())}
                                disabled={deletingUserId === user._id?.toString()}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                {deletingUserId === user._id?.toString() ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-8">
              <p className="text-foreground/70">No users found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UsersLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-xl text-foreground/80">Loading user management...</p>
    </div>
  );
}

export default function ManageUsersPage() {
  return (
    // No useSearchParams here, so Suspense might not be strictly needed unless child components use it.
    // Keeping it simple for now.
    <ManageUsersPageComponent />
  );
}
