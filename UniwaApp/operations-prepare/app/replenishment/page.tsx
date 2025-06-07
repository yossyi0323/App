"use client";

import { useState, useEffect, useRef } from 'react';
import { DateSelector } from '@/components/date-selector';
import { PlaceSelector } from '@/components/inventory/place-selector';
import { getPlaces, getItemsBySource, getInventoryStatusByDate, saveInventoryStatusesBulk } from '@/lib/db-service';
import type { Place, InventoryStatus, InventoryStatusViewModel } from '@/lib/types';
import { PLACE_TYPE } from '@/lib/schemas/enums/place-type';
import { getCode, isEnumCode, EnumCode, getCodeAsEnumCode, getLogicalName } from '@/lib/utils/enum-utils';
import { INVENTORY_STATUS } from '@/lib/schemas/enums/inventory-status';
import { REPLENISHMENT_STATUS } from '@/lib/schemas/enums/replenishment-status';
import { PREPARATION_STATUS } from '@/lib/schemas/enums/preparation-status';
import { ORDER_REQUEST_STATUS } from '@/lib/schemas/enums/order-request-status';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { Button } from '@/components/ui/button';
import { createInventoryStatusFromViewModel } from '@/lib/utils/inventory-status-utils';
import { LABELS } from '@/lib/constants/labels';
import { MESSAGES, $msg, ERROR } from '@/lib/constants/messages';
import { InventoryItemCard } from '@/components/inventory/inventory-item-card';
import { ReplenishItemCard } from '@/components/replenishment/replenish-item-card';
import { toEnumCode } from '@/lib/utils/enum-utils';
import { PREPARATION_PATTERN } from '@/lib/schemas/enums/preparation-pattern';

export default function ReplenishmentPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [items, setItems] = useState<InventoryStatusViewModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const itemsRef = useRef<InventoryStatusViewModel[]>([]);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const placeType = getCode(PLACE_TYPE, 'SOURCE');

  // 場所一覧の取得
  useEffect(() => {
    async function loadPlaces() {
      try {
        const { data, error } = await getPlaces();
        if (error) throw error;
        if (data) {
          setPlaces(data);
          const firstSource = data.find(place => place.place_type === placeType);
          if (firstSource) {
            setSelectedPlaceId(firstSource.place_id);
          }
        }
      } catch (err: any) {
        setError($msg(ERROR.E10001, LABELS.LOCATION) + (err?.message ? `: ${err.message}` : ''));
      } finally {
        setIsLoading(false);
      }
    }
    loadPlaces();
  }, []);

  // 品目・在庫ステータスの取得
  useEffect(() => {
    if (!selectedPlaceId) return;
    async function loadItems() {
      setIsLoading(true);
      try {
        const { data: items, error: itemsError } = await getItemsBySource(selectedPlaceId as string);
        if (itemsError) throw itemsError;
        const date = selectedDate.toISOString().split('T')[0];
        const { data: statuses, error: statusError } = await getInventoryStatusByDate(date);
        if (statusError) throw statusError;
        const viewModels = items?.map(item => ({
          item,
          status: statuses?.find(status => status.item_id === item.item_id) || null
        })) || [];
        setItems(viewModels);
      } catch (err: any) {
        setError($msg(ERROR.E10001, LABELS.ITEM) + (err?.message ? `: ${err.message}` : ''));
      } finally {
        setIsLoading(false);
      }
    }
    loadItems();
  }, [selectedPlaceId, selectedDate]);

  // ステータス更新
  const handleItemStatusChange = (itemId: string, field: keyof InventoryStatus, value: InventoryStatus[keyof InventoryStatus]) => {
    setItems(prev => prev.map(vm => {
      if (vm.item.item_id !== itemId) return vm;
      return {
        ...vm,
        status: createInventoryStatusFromViewModel(vm, selectedDate, { [field]: value })
      };
    }));
  };
  
  const handlePlaceChange = (placeId: string) => {
    setSelectedPlaceId(placeId);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{LABELS.INVENTORY_CHECK}</h1>
      <DateSelector date={selectedDate} onDateChange={setSelectedDate} />
      <div className="mb-3">
        <PlaceSelector
          places={places}
          selectedPlaceId={selectedPlaceId}
          onPlaceChange={handlePlaceChange}
          type={placeType}
          className="w-full"
        />
      </div>
      {error && <ErrorMessage message={error} className="mb-4" />}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <LoadingIndicator />
        </div>
      ) : items.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">
            {selectedPlaceId
              ? $msg(MESSAGES.W20010)
              : $msg(MESSAGES.I30020)}
          </p>
        </div>
      ) : (
        <div>
          {items
            .filter(vm => {
              // 補充パターン区分が「移動」
              const patternType = vm.item.pattern_type ? toEnumCode(PREPARATION_PATTERN, vm.item.pattern_type) : undefined;
              const isMove = patternType && isEnumCode(PREPARATION_PATTERN, patternType, 'MOVE');
              // 補充ステータスが「要補充」または「補充済」
              const status = vm.status ? vm.status : createInventoryStatusFromViewModel(vm, selectedDate);
              const replenishmentStatus = getCodeAsEnumCode(REPLENISHMENT_STATUS, getLogicalName(REPLENISHMENT_STATUS, status.replenishment_status));
              const isTargetStatus =
                isEnumCode(REPLENISHMENT_STATUS, replenishmentStatus, 'REQUIRED') ||
                isEnumCode(REPLENISHMENT_STATUS, replenishmentStatus, 'COMPLETED');
              return isMove && isTargetStatus;
            })
            .map(vm => {
              const status = vm.status ? vm.status : createInventoryStatusFromViewModel(vm, selectedDate);
              return (
                <ReplenishItemCard
                  key={vm.item.item_id}
                  item={vm.item}
                  date={selectedDate.toISOString().split('T')[0]}
                  currentStock={status.current_stock}
                  restockAmount={status.replenishment_count}
                  replenishmentStatus={getCodeAsEnumCode(REPLENISHMENT_STATUS, getLogicalName(REPLENISHMENT_STATUS, status.replenishment_status))}
                  preparationStatus={getCodeAsEnumCode(PREPARATION_STATUS, getLogicalName(PREPARATION_STATUS, status.preparation_status))}
                  orderStatus={getCodeAsEnumCode(ORDER_REQUEST_STATUS, getLogicalName(ORDER_REQUEST_STATUS, status.order_status))}
                  memo={status.memo}
                  isChecked={isEnumCode(INVENTORY_STATUS, status.check_status, 'CONFIRMED')}
                  patternType={vm.item.pattern_type ? toEnumCode(PREPARATION_PATTERN, vm.item.pattern_type) : undefined}
                  onStockChange={v => handleItemStatusChange(vm.item.item_id, 'current_stock', v)}
                  onRestockChange={v => handleItemStatusChange(vm.item.item_id, 'replenishment_count', v)}
                  onMemoChange={v => handleItemStatusChange(vm.item.item_id, 'memo', v)}
                  onCheckChange={v => handleItemStatusChange(
                    vm.item.item_id, 
                    'check_status', 
                    v 
                      ? getCodeAsEnumCode(INVENTORY_STATUS, 'CONFIRMED') 
                      : getCodeAsEnumCode(INVENTORY_STATUS, 'UNCONFIRMED'))}
                  onOrderRequest={() => handleItemStatusChange(
                    vm.item.item_id, 
                    'order_status', 
                    isEnumCode(ORDER_REQUEST_STATUS, status.order_status, 'NOT_REQUIRED') 
                      ? getCodeAsEnumCode(ORDER_REQUEST_STATUS, 'REQUIRED') 
                      : getCodeAsEnumCode(ORDER_REQUEST_STATUS, 'NOT_REQUIRED'))}
                  onPreparationStatusChange={v => handleItemStatusChange(vm.item.item_id, 'preparation_status', v)}
                  onNeedsRestockChange={v => handleItemStatusChange(
                    vm.item.item_id,
                    'replenishment_status',
                    v
                      ? getCodeAsEnumCode(REPLENISHMENT_STATUS, 'REQUIRED')
                      : getCodeAsEnumCode(REPLENISHMENT_STATUS, 'COMPLETED')
                  )}
                />
              );
            })}
        </div>
      )}
    </div>
  );
} 