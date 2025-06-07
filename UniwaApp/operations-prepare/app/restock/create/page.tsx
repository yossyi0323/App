'use client';

import { useState, useEffect } from 'react';
import { DateSelector } from '@/components/date-selector';
import { RestockItemCard } from '@/components/restock/restock-item-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getItems, getItemPrepPatterns } from '@/lib/db-service';
import { saveBatchInventoryStatuses } from '@/lib/local-storage';
import type { Item, ItemPrepPattern, InventoryStatus } from '@/lib/types';

export default function RestockCreatePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [items, setItems] = useState<Item[]>([]);
  const [itemPatterns, setItemPatterns] = useState<ItemPrepPattern[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load items and patterns on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Load all items
        const { data: itemsData, error: itemsError } = await getItems();
        if (itemsError) throw itemsError;
        
        // Load all prep patterns
        const { data: patternsData, error: patternsError } = await getItemPrepPatterns();
        if (patternsError) throw patternsError;
        
        if (itemsData && patternsData) {
          setItems(itemsData);
          setItemPatterns(patternsData);
          
          // Filter items that are for creation
          const creationItems = itemsData.filter(item => 
            patternsData.some(pattern => 
              pattern.itemId === item.id && pattern.patternType === 'create'
            )
          );
          
          setItems(creationItems);
        }
      } catch (err: any) {
        setError('データの読み込み中にエラーが発生しました: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleMarkAllCreated = () => {
    if (!items.length) return;
    
    const dateString = selectedDate.toISOString().split('T')[0];
    const updatedStatuses: InventoryStatus[] = items.map(item => ({
      date: dateString,
      itemId: item.id,
      checkStatus: 'checked',
      restockStatus: 'restocked',
      createStatus: 'created',
      orderStatus: 'not-required',
      currentStock: 0,
      restockAmount: 0
    }));
    
    saveBatchInventoryStatuses(updatedStatuses);
    // Force re-render
    setItems([...items]);
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">補充（作成）</h1>
      
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
          onClick={handleMarkAllCreated}
        >
          全て作成済みにする
        </Button>
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">作成が必要な品物はありません</p>
        </div>
      ) : (
        <div>
          {items.map(item => (
            <RestockItemCard
              key={item.id}
              item={item}
              date={selectedDate.toISOString().split('T')[0]}
              showCreateOptions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}