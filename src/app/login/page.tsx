
"use client";

import { FormEvent, useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function LoginPageContent() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log("Login attempt with Email:", email); 

    if (!email || !password) {
      setError("Email and password are required.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Calling signIn with credentials..."); 
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false, 
      });

      console.log("signIn response:", res); 

      if (res?.error) {
        console.error("Client-side Sign in error from NextAuth:", res.error);
        const errorMessage = res.error === "CredentialsSignin" ? "Invalid email or password." : "An unexpected error occurred. Please check server logs.";
        setError(errorMessage);
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (res?.ok) {
        console.log("Login successful, redirecting to:", callbackUrl); 
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        router.push(callbackUrl); 
        router.refresh(); 
      } else {
        console.warn("signIn response was not an error but also not ok:", res);
        setError("An unexpected error occurred during login. Please check console.");
         toast({
          title: "Login Failed",
          description: "An unexpected error occurred. Please try again or check console.",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Exception during client-side signIn call:", e);
      setError("An exception occurred. Please try again or check console.");
      toast({
          title: "Login Error",
          description: "An unexpected error occurred. Please try again or check console.",
          variant: "destructive",
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Sign In</CardTitle>
          <CardDescription>Access your Marpu account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 p-3 rounded-md text-center text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                name="email"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                name="password"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 text-sm">
          <p>
            Don&apos;t have an account?{" "}
            <Button variant="link" asChild className="px-1 text-accent">
              <Link href="/register">Register here</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

function LoginPageLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] py-12">
      <Card className="w-full max-w-md shadow-xl opacity-50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Sign In</CardTitle>
          <CardDescription>Access your Marpu account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-10 bg-muted rounded-md animate-pulse"></div>
          <div className="h-10 bg-muted rounded-md animate-pulse"></div>
          <div className="h-10 bg-muted rounded-md animate-pulse"></div>
           <Button className="w-full" disabled>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading...
          </Button>
        </CardContent>
         <CardFooter className="flex flex-col items-center space-y-2 text-sm">
          <p>
            Don&apos;t have an account?{" "}
            <span className="text-accent">Register here</span>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageLoadingSkeleton />}>
      <LoginPageContent />
    </Suspense>
  );
}
