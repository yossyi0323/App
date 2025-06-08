'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar as CalendarIcon, Box, Truck, PlusCircle, ShoppingCart, Clipboard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReservationForm } from '@/components/reservation/reservation-form';
import { DateSelector } from '@/components/date-selector';
import { getDateFromDateTime } from '@/lib/utils/date-time-utils';
import { useBusinessDate } from '@/lib/contexts/BusinessDateContext';

export default function Home() {
  const { businessDate, setBusinessDate } = useBusinessDate();
  const router = useRouter();
  
  const handleDateChange = (date: Date) => {
    setBusinessDate(date.toISOString().split('T')[0]);
  };
  
  const menuItems = [
    { name: '在庫確認', icon: <Box className="h-6 w-6" />, path: '/inventory', description: '各場所の在庫数を確認' },
    { name: '補充（移動）', icon: <Truck className="h-6 w-6" />, path: '/restock/move', description: '在庫の補充・移動' },
    { name: '補充（作成）', icon: <PlusCircle className="h-6 w-6" />, path: '/restock/create', description: '不足している品物の作成' },
    { name: '発注依頼', icon: <ShoppingCart className="h-6 w-6" />, path: '/order', description: '発注が必要な品物の依頼' },
    { name: '状況一覧', icon: <Clipboard className="h-6 w-6" />, path: '/status', description: '営業準備の状況確認' },
  ];
  
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">トップページ</h1>
      
      <DateSelector date={new Date(businessDate)} onDateChange={handleDateChange} />
      
      <div className="grid gap-4">
        <ReservationForm date={businessDate} />
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">業務メニュー</CardTitle>
            <CardDescription>
              準備業務を開始する
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  variant="outline"
                  className="h-auto py-3 justify-start text-left"
                  onClick={() => router.push(item.path)}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}