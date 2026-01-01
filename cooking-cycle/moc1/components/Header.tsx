'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold">
          料理サイクル
        </Link>
        <nav className="flex items-center gap-4">
          {session ? (
            <>
              <Link href="/recipes">
                <Button variant="ghost">レシピ</Button>
              </Link>
              <Link href="/stocks">
                <Button variant="ghost">ストック</Button>
              </Link>
              <Link href="/search">
                <Button variant="ghost">検索</Button>
              </Link>
              <Button variant="ghost" onClick={() => signOut()}>
                ログアウト
              </Button>
            </>
          ) : (
            <Button onClick={() => signIn('google')}>
              Googleでログイン
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
