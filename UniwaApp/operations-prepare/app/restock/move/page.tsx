'use client';

import { useState, useEffect } from 'react';
import { DateSelector } from '@/components/date-selector';
import { PlaceSelector } from '@/components/inventory/place-selector';
import { RestockItemCard } from '@/components/restock/restock-item-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getPlaces, getItemsBySource } from '@/lib/db-service';
import { saveBatchInventoryStatuses } from '@/lib/local-storage';
import type { Place, Item, InventoryStatus } from '@/lib/types';
import { PLACE_TYPE } from '@/lib/schemas/enums/place-type';
import { INVENTORY_STATUS } from '@/lib/schemas/enums/inventory-status';
import { REPLENISHMENT_STATUS } from '@/lib/schemas/enums/replenishment-status';
import { getCode } from '@/lib/utils/enum-utils';

export default function RestockMovePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load places on mount
  useEffect(() => {
    async function loadPlaces() {
      try {
        const { data, error } = await getPlaces();
        if (error) throw error;
        
        if (data) {
          setPlaces(data);
          // Auto-select first source place if available
          const firstSource = data.find(place => place.place_type === getCode(PLACE_TYPE, 'SOURCE'));
          if (firstSource) {
            setSelectedPlaceId(firstSource.place_id);
          }
        }
      } catch (err: any) {
        setError('場所の読み込み中にエラーが発生しました: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPlaces();
  }, []);
  
  // Load items when place changes
  useEffect(() => {
    if (!selectedPlaceId) return;
    
    async function loadItems() {
      setIsLoading(true);
      try {
        const { data, error } = await getItemsBySource(selectedPlaceId ?? '');
        if (error) throw error;
        
        // Only show items that need restocking
        setItems(data || []);
      } catch (err: any) {
        setError('商品の読み込み中にエラーが発生しました: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadItems();
  }, [selectedPlaceId]);
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handlePlaceChange = (placeId: string) => {
    setSelectedPlaceId(placeId);
  };
  
  const handleMarkAllRestocked = () => {
    if (!items.length) return;
    
    const dateString = selectedDate.toISOString().split('T')[0];
    const updatedStatuses: InventoryStatus[] = items.map(item => ({
      business_date: dateString,
      item_id: item.item_id,
      check_status: getCode(INVENTORY_STATUS, 'CONFIRMED'),
      replenishment_status: getCode(REPLENISHMENT_STATUS, 'COMPLETED'),
      preparation_status: '',
      order_status: '',
      current_stock: 0,
      replenishment_count: 0,
      memo: '',
      inventory_status_id: '',
      created_at: '',
      updated_at: '',
    }));
    
    saveBatchInventoryStatuses(updatedStatuses);
    // Force re-render
    setItems([...items]);
  };
  
  // Find selected place name
  const selectedPlace = places.find(place => place.place_id === selectedPlaceId);
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">補充（移動）</h1>
      
      <DateSelector date={selectedDate} onDateChange={handleDateChange} />
      
      <div className="mb-4">
        <PlaceSelector
          places={places}
          selectedPlaceId={selectedPlaceId}
          onPlaceChange={handlePlaceChange}
          type={getCode(PLACE_TYPE, 'SOURCE')}
          className="w-full"
        />
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {selectedPlaceId && (
        <div className="mb-4">
          <h2 className="text-lg font-medium mb-2">{selectedPlace?.place_name}</h2>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleMarkAllRestocked}
          >
            全て補充済みにする
          </Button>
        </div>
      )}
      
      {isLoading ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            {selectedPlaceId 
              ? 'この場所に登録されている要補充の品物はありません' 
              : '補充元を選択してください'}
          </p>
        </div>
      ) : (
        <div>
          {items.map(item => (
            <RestockItemCard
              key={item.item_id}
              item={item}
              date={selectedDate.toISOString().split('T')[0]}
            />
          ))}
        </div>
      )}
    </div>
  );
}