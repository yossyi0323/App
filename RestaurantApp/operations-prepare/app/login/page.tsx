'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/login-form';
import { useSupabase } from '@/components/provider/supabase-provider';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';

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
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator />
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
