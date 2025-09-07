import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/provider/theme-provider';
import { SupabaseProvider } from '@/components/provider/supabase-provider';
import { BusinessDateProvider } from '@/lib/contexts/BusinessDateContext';
import AuthGuard from '@/components/auth/auth-guard';
import MainLayout from '@/components/layout/main-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '飲食店営業準備アプリ',
  description: '翌日の営業に向けた準備業務を効率化',
  manifest: '/manifest.json',
  themeColor: '#000000',
  icons: {
    icon: '/icon.jpg',
    shortcut: '/icon.jpg',
    apple: '/icon.jpg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '営業準備アプリ'
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
            <BusinessDateProvider>
              <AuthGuard>
                <MainLayout>{children}</MainLayout>
              </AuthGuard>
            </BusinessDateProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
