'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSupabase } from '@/components/provider/supabase-provider';

type AuthGuardProps = {
  children: React.ReactNode;
};

export default function AuthGuard({ children }: AuthGuardProps) {
  const { session, isLoading } = useSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  const DISABLE_AUTH = process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true';
  if (DISABLE_AUTH) {
    return <>{children}</>;
  }
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isLoading) {
      if (!session && pathname !== '/login') {
        router.push('/login');
      } else if (session && pathname === '/login') {
        router.push('/');
      }
    }
  }, [session, isLoading, router, pathname, isClient]);

  // Show loading or nothing during authentication check
  if (isLoading || !isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Public route is login
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Protected route, but not authenticated
  if (!session) {
    return null;
  }

  // Protected route and authenticated
  return <>{children}</>;
}