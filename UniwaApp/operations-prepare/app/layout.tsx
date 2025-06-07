import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/provider/theme-provider';
import { SupabaseProvider } from '@/components/provider/supabase-provider';
import AuthGuard from '@/components/auth/auth-guard';
import MainLayout from '@/components/layout/main-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '飲食店営業準備アプリ',
  description: '翌日の営業に向けた準備業務を効率化',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SupabaseProvider>
            <AuthGuard>
              <MainLayout>
                {children}
              </MainLayout>
            </AuthGuard>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}