'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, Sun, Moon, Home, Box, Truck, PlusCircle, ShoppingCart, Clipboard } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { ScrollArea } from "@/components/ui/scroll-area";
import { LABELS } from '@/lib/constants/labels';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { name: LABELS.MENU_HOME, icon: <Home className="h-5 w-5" />, path: '/' },
    { name: LABELS.INVENTORY_CHECK, icon: <Box className="h-5 w-5" />, path: '/inventory' },
    { name: LABELS.REPLENISHMENT, icon: <Truck className="h-5 w-5" />, path: '/replenishment' },
    { name: LABELS.ORDER_REQUEST, icon: <ShoppingCart className="h-5 w-5" />, path: '/order' },
    { name: LABELS.STATUS_LIST, icon: <Clipboard className="h-5 w-5" />, path: '/status' },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">メニュー</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-medium">メニュー</h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <ScrollArea className="flex-1">
                    <nav className="px-2 py-4">
                      <ul className="space-y-2">
                        {menuItems.map((item) => (
                          <li key={item.path}>
                            <Link 
                              href={item.path}
                              onClick={() => setIsOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                                pathname === item.path 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'hover:bg-secondary'
                              }`}
                            >
                              {item.icon}
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold">
              営業準備アプリ
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {mounted && (
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">テーマ切替</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container px-4 py-4 max-w-lg mx-auto">
        {children}
      </main>

      {/* Mobile navigation */}
      <div className="md:hidden sticky bottom-0 z-40 bg-background border-t border-border">
        <nav className="flex items-center justify-around h-16">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full text-xs ${
                pathname === item.path 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              {item.icon}
              <span className="mt-1">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}