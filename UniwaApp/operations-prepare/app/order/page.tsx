'use client';

import { useState, useEffect } from 'react';
import { DateSelector } from '@/components/date-selector';
import { OrderItemCard } from '@/components/order/order-item-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getItems } from '@/lib/db-service';
import { saveBatchInventoryStatuses } from '@/lib/local-storage';
import type { Item, InventoryStatus } from '@/lib/types';

export default function OrderPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load items on mount
  useEffect(() => {
    async function loadItems() {
      try {
        const { data, error } = await getItems();
        if (error) throw error;
        
        setItems(data || []);
      } catch (err: any) {
        setError('商品の読み込み中にエラーが発生しました: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadItems();
  }, []);
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleMarkAllOrdered = () => {
    if (!items.length) return;
    
    const dateString = selectedDate.toISOString().split('T')[0];
    const updatedStatuses: InventoryStatus[] = items.map(item => ({
      date: dateString,
      itemId: item.id,
      checkStatus: 'checked',
      restockStatus: 'not-required',
      createStatus: 'not-required',
      orderStatus: 'ordered',
      currentStock: 0,
      restockAmount: 0
    }));
    
    saveBatchInventoryStatuses(updatedStatuses);
    // Force re-render
    setItems([...items]);
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">発注依頼</h1>
      
      <DateSelector date={selectedDate} onDateChange={handleDateChange} />
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="mb-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleMarkAllOrdered}
        >
          全て発注依頼済みにする
        </Button>
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">発注依頼が必要な品物はありません</p>
        </div>
      ) : (
        <div>
          {items.map(item => (
            <OrderItemCard
              key={item.id}
              item={item}
              date={selectedDate.toISOString().split('T')[0]}
            />
          ))}
        </div>
      )}
    </div>
  );
}