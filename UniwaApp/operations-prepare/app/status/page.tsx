'use client';

import { useState, useEffect } from 'react';
import { DateSelector } from '@/components/date-selector';
import { StatusOverview } from '@/components/status/status-overview';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getItems, getInventoryStatusByDate } from '@/lib/db-service';
import type { Item, InventoryStatus } from '@/lib/types';
import { getDateFromDateTime } from '@/lib/utils/date-time-utils';

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
  
  // Load inventory statuses when date changes
  useEffect(() => {
    async function loadInventoryStatuses() {
      try {
        const dateString = getDateFromDateTime(selectedDate);
        const { data, error } = await getInventoryStatusByDate(dateString);
        if (error) throw error;
        
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
        <div className="py-8 text-center">
          <p className="text-muted-foreground">読み込み中...</p>
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