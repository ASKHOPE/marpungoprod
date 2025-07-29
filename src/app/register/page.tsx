
"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/actions/register"; // Server action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (formData: FormData) => {
    setError(undefined);
    setSuccess(undefined);

    startTransition(async () => {
      const result = await register({
        email: formData.get("email"),
        password: formData.get("password"),
        name: formData.get("name"),
      });

      if (result?.error) {
        setError(result.error);
        if (result.details) {
          // For more detailed Zod errors, you might want to format them
          const errorMessages = Object.values(result.details).flat().join(" ");
          toast({
            title: "Registration Failed",
            description: `${result.error} ${errorMessages || ""}`,
            variant: "destructive",
          });
        } else {
           toast({
            title: "Registration Failed",
            description: result.error,
            variant: "destructive",
          });
        }
      } else if (result?.success) {
        setSuccess(result.success);
        ref.current?.reset();
        toast({
          title: "Registration Successful!",
          description: "Please log in with your new account.",
        });
        router.push("/login");
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Create an Account</CardTitle>
          <CardDescription>Join Marpu community.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={ref} action={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 p-3 rounded-md text-center text-sm text-destructive">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 p-3 rounded-md text-center text-sm text-green-700 dark:text-green-400">
                {success}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Jane Doe"
                name="name"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                name="email"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="•••••••• (min. 6 characters)"
                name="password"
                required
                disabled={isPending}
              />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-5 w-5" />
              )}
              {isPending ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
          <p>
            Already have an account?{" "}
            <Button variant="link" asChild className="px-1 text-accent">
              <Link href="/login">Sign in</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
