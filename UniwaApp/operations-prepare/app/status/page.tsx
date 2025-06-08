'use client';

import { useState, useEffect } from 'react';
import { DateSelector } from '@/components/date-selector';
import { StatusOverview } from '@/components/status/status-overview';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getDateFromDateTime } from '@/lib/utils/date-time-utils';
import type { Item, InventoryStatus } from '@/lib/types';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';

export default function StatusPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [items, setItems] = useState<Item[]>([]);
  const [inventoryStatuses, setInventoryStatuses] = useState<InventoryStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load items on mount
  useEffect(() => {
    async function loadItems() {
      try {
        const response = await fetch('/api/items');
        const data: Item[] = await response.json();
        setItems(data || []);
      } catch (err: any) {
        setError('商品の読み込み中にエラーが発生しました: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadItems();
  }, []);
  
  // Load inventory statuses when date changes
  useEffect(() => {
    async function loadInventoryStatuses() {
      try {
        const dateString = getDateFromDateTime(selectedDate);
        const response = await fetch(`/api/inventory-status?date=${dateString}`);
        const data: InventoryStatus[] = await response.json();
        setInventoryStatuses(data || []);
      } catch (err: any) {
        setError('在庫状況の読み込み中にエラーが発生しました: ' + err.message);
      }
    }
    
    if (items.length > 0) {
      loadInventoryStatuses();
    }
  }, [selectedDate, items]);
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">営業準備状況</h1>
      
      <DateSelector date={selectedDate} onDateChange={handleDateChange} />
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <LoadingIndicator />
        </div>
      ) : (
        <StatusOverview
          date={getDateFromDateTime(selectedDate)}
          items={items}
          inventoryStatuses={inventoryStatuses}
        />
      )}
    </div>
  );
}