
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Loader2 } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);

  // You can use query parameters from Stripe if needed, e.g., session_id
  // const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-3xl font-headline text-primary">Payment Successful!</CardTitle>
          <CardDescription className="text-lg text-foreground/80">
            Thank you for your generous donation. Your support makes a real difference.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground/70">
            You will be automatically redirected to the homepage in{' '}
            <span className="font-bold text-primary">{countdown}</span> seconds.
          </p>
          <p className="text-sm text-muted-foreground">
            If you are not redirected, please click the button below.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" /> Go to Homepage
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function PaymentSuccessLoadingSkeleton() {
  return (
     <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
      <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
      <p className="text-xl text-foreground/80">Loading payment confirmation...</p>
    </div>
  );
}


export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessLoadingSkeleton />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
