'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/login-form';
import { useSupabase } from '@/components/provider/supabase-provider';

export default function LoginPage() {
  const { session, isLoading } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (session && !isLoading) {
      router.push('/');
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}