
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, AlertTriangle, UserCog } from 'lucide-react';
import type { UserDocument } from '@/types/db';
import { useSession } from 'next-auth/react';


const userEditSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'user'], { required_error: 'Role is required' }),
});

type UserEditFormData = z.infer<typeof userEditSchema>;

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  
  const userId = params.id as string;

  const [user, setUser] = useState<UserDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema),
  });

  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch(`/api/admin/manage/users/${userId}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to fetch user: ${response.statusText}`);
          }
          const data: UserDocument = await response.json();
          setUser(data);
          reset({
            name: data.name,
            email: data.email,
            role: data.role,
          });
        } catch (err) {
          console.error('Failed to fetch user:', err);
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
          toast({
            title: 'Error Fetching User',
            description: err instanceof Error ? err.message : 'Could not load user details.',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchUser();
    }
  }, [userId, reset, toast]);

  const onSubmit: SubmitHandler<UserEditFormData> = async (data) => {
    if (!user?._id) {
      toast({ title: 'Error', description: 'User ID is missing.', variant: 'destructive' });
      return;
    }
    
    if (user._id.toString() === session?.user?.id && data.role !== 'admin' && user.role === 'admin') {
      const adminCountResponse = await fetch('/api/admin/stats'); // Assuming this can provide admin count or create a specific endpoint
      if (adminCountResponse.ok) {
        const stats = await adminCountResponse.json();
        const totalUsersResponse = await fetch('/api/admin/manage/users');
        let totalAdmins = 0;
        if(totalUsersResponse.ok){
            const allUsers: UserDocument[] = await totalUsersResponse.json();
            totalAdmins = allUsers.filter(u => u.role === 'admin').length;
        }

        if (totalAdmins <= 1) {
          toast({
            title: 'Action Prohibited',
            description: 'Cannot demote the only admin account.',
            variant: 'destructive',
          });
          return;
        }
      }
    }


    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/manage/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update user');
      }

      toast({
        title: 'Success',
        description: 'User details updated successfully!',
      });
      router.push('/admin/manage/users');
    } catch (error) {
      console.error('Failed to update user:', error);
      toast({
        title: 'Error Updating User',
        description: (error instanceof Error ? error.message : 'An unexpected error occurred.'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-xl text-foreground/80">Loading user details...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Error Loading User</h1>
        <p className="text-foreground/80 mb-8">{error || 'User data could not be found.'}</p>
        <Button asChild variant="outline">
          <Link href="/admin/manage/users">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to User Management
          </Link>
        </Button>
      </div>
    );
  }

  const isEditingSelf = session?.user?.id === user._id.toString();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/manage/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User Management
          </Link>
        </Button>
      </div>
      <Card className="max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <UserCog className="w-6 h-6 mr-3 text-accent" /> Edit User: {user?.name}
          </CardTitle>
          <CardDescription>Update the user's details. Be cautious when changing roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
                <Label htmlFor="role">Role</Label>
                 <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                        <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={isSubmitting}
                        >
                        <SelectTrigger id="role">
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                        </Select>
                    )}
                />
                {errors.role && <p className="text-sm text-destructive mt-1">{errors.role.message}</p>}
                 {isEditingSelf && user.role === 'admin' && (
                    <p className="text-xs text-amber-600 mt-1">Caution: You are editing your own admin account. Changing your role to 'User' may lock you out of admin functionalities if you are the only admin.</p>
                )}
            </div>
            <p className="text-sm text-muted-foreground">
              Note: Password changes are handled by users themselves through a password reset process (if implemented). Admins cannot directly set user passwords here.
            </p>
            <Button type="submit" className="w-full mt-4" disabled={isSubmitting || isLoading}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Update User Details
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
