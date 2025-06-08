"use client";

import { useState, useEffect } from 'react';
import { DateSelector } from '@/components/date-selector';
import { PlaceSelector } from '@/components/inventory/place-selector';
import { getPlaces, getItemsBySource, getInventoryStatusByDate, saveInventoryStatusesBulk } from '@/lib/db-service';
import type { Place, InventoryStatus, InventoryStatusViewModel, Item } from '@/lib/types';
import { PLACE_TYPE } from '@/lib/schemas/enums/place-type';
import { getCode, isEnumCode, EnumCode, getCodeAsEnumCode, getLogicalName, getDisplayName, toEnumCode } from '@/lib/utils/enum-utils';
import { INVENTORY_STATUS } from '@/lib/schemas/enums/inventory-status';
import { REPLENISHMENT_STATUS } from '@/lib/schemas/enums/replenishment-status';
import { PREPARATION_STATUS } from '@/lib/schemas/enums/preparation-status';
import { ORDER_REQUEST_STATUS } from '@/lib/schemas/enums/order-request-status';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { LABELS } from '@/lib/constants/labels';
import { MESSAGES, $msg, ERROR } from '@/lib/constants/messages';
import { createInventoryStatusFromViewModel, useInventoryAutoSave } from '@/lib/utils/inventory-status-utils';
import { PREPARATION_PATTERN } from '@/lib/schemas/enums/preparation-pattern';
import { Badge } from '@/components/ui/badge';
import { AutoSaveWrapper } from '@/components/common/auto-save-wrapper';
import { STORAGE_KEY_PREFIX, SYMBOLS, ALL_SOURCE_PLACES } from '@/lib/constants/constants';
import { getDateFromDateTime } from '@/lib/utils/date-time-utils';
import { CreationItemCard } from '@/components/creation/creation-item-card';

export default function CreationPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [items, setItems] = useState<InventoryStatusViewModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const autoSaveRef = useInventoryAutoSave({
    items,
    selectedPlaceId,
    selectedDate,
    setError,
    storageKeyPrefix: STORAGE_KEY_PREFIX.CREATION,
  });

  const placeType = getCode(PLACE_TYPE, 'SOURCE');

  // 場所一覧の取得
  useEffect(() => {
    async function loadPlaces() {
      try {
        const { data, error } = await getPlaces();
        if (error) throw error;
        if (data) {
          setPlaces(data);
          // 初期値は「全補充元」を選択
          setSelectedPlaceId(ALL_SOURCE_PLACES.KEY);
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
        let itemsData: Item[] = [];
        if (selectedPlaceId === ALL_SOURCE_PLACES.KEY) {
          // 全補充元の品目を取得
          const sourcePlaces = places.filter(place => place.place_type === placeType);
          for (const place of sourcePlaces) {
            const { data, error: itemsError } = await getItemsBySource(place.place_id);
            if (itemsError) throw itemsError;
            if (data) {
              itemsData = [...itemsData, ...data];
            }
          }
        } else {
          const { data, error: itemsError } = await getItemsBySource(selectedPlaceId as string);
          if (itemsError) throw itemsError;
          if (data) {
            itemsData = data;
          }
        }
        const date = getDateFromDateTime(selectedDate);
        const { data: statuses, error: statusError } = await getInventoryStatusByDate(date);
        if (statusError) throw statusError;
        const viewModels = itemsData.map(item => ({
          item,
          status: statuses?.find(status => status.item_id === item.item_id) || null
        }));
        setItems(viewModels);
      } catch (err: any) {
        setError($msg(ERROR.E10001, LABELS.ITEM) + (err?.message ? `: ${err.message}` : ''));
      } finally {
        setIsLoading(false);
      }
    }
    loadItems();
  }, [selectedPlaceId, selectedDate, places]);

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
    <AutoSaveWrapper autoSaveManager={autoSaveRef.current}>
      <div>
        <h1 className="text-xl font-bold mb-4">{LABELS.CREATION}</h1>
        <DateSelector date={selectedDate} onDateChange={setSelectedDate} />
        <div className="mb-3">
          <PlaceSelector
            places={[
              { place_id: ALL_SOURCE_PLACES.KEY, place_name: ALL_SOURCE_PLACES.LABEL, place_type: placeType, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
              ...places.filter(place => place.place_type === placeType)
            ]}
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
            {/* ヘッダー行 */}
            {(() => {
              // 件数集計
              const filtered = items.filter(vm => {
                const patternType = vm.item.pattern_type ? toEnumCode(PREPARATION_PATTERN, vm.item.pattern_type) : undefined;
                const creationCode = getCode(PREPARATION_PATTERN, 'CREATION');
                const isCreation = patternType && creationCode && isEnumCode(PREPARATION_PATTERN, patternType, 'CREATION');
                return isCreation;
              });
              const countRequired = filtered.filter(vm => {
                const status = vm.status ? vm.status : createInventoryStatusFromViewModel(vm, selectedDate);
                return isEnumCode(PREPARATION_STATUS, status.preparation_status, 'REQUIRED');
              }).length;
              const countRequested = filtered.filter(vm => {
                const status = vm.status ? vm.status : createInventoryStatusFromViewModel(vm, selectedDate);
                return isEnumCode(PREPARATION_STATUS, status.preparation_status, 'REQUESTED');
              }).length;
              const total = filtered.length;
              const allCleared = countRequired === 0 || total === 0;
              return (
                <div className="flex items-center px-2 py-2 border-b border-border text-sm mb-2 justify-between">
                  <div className="flex gap-2 ml-2">
                    <Badge
                      variant={allCleared ? "secondary" : "default"}
                      className="text-xs font-normal px-2 py-0.5 align-middle"
                    >
                      {getDisplayName(PREPARATION_STATUS, 'REQUIRED')}{SYMBOLS.COLON}{countRequired}{SYMBOLS.SLASH}{total}
                    </Badge>
                    {countRequested > 0 ? <Badge
                      variant="default"
                      className="text-xs font-normal px-2 py-0.5 align-middle"
                    >
                      {getDisplayName(PREPARATION_STATUS, 'REQUESTED')}{SYMBOLS.COLON}{countRequested}
                    </Badge> : null}
                  </div>
                </div>
              );
            })()}
            {items
              .filter(vm => {
                const patternType = vm.item.pattern_type ? toEnumCode(PREPARATION_PATTERN, vm.item.pattern_type) : undefined;
                const creationCode = getCode(PREPARATION_PATTERN, 'CREATION');
                const isCreation = patternType && creationCode && isEnumCode(PREPARATION_PATTERN, patternType, 'CREATION');
                return isCreation;
              })
              .map(vm => {
                const status = vm.status ? vm.status : createInventoryStatusFromViewModel(vm, selectedDate);
                return (
                  <CreationItemCard
                    key={vm.item.item_id}
                    item={vm.item}
                    date={getDateFromDateTime(selectedDate)}
                    currentStock={status.current_stock}
                    replenishmentCount={status.replenishment_count}
                    replenishmentStatus={status.replenishment_status as EnumCode<typeof REPLENISHMENT_STATUS>}
                    preparationStatus={status.preparation_status as EnumCode<typeof PREPARATION_STATUS>}
                    orderStatus={status.order_status as EnumCode<typeof ORDER_REQUEST_STATUS>}
                    memo={status.memo}
                    isChecked={!isEnumCode(REPLENISHMENT_STATUS, status.replenishment_status, 'REQUIRED')}
                    patternType={vm.item.pattern_type as EnumCode<typeof PREPARATION_PATTERN>}
                    onStockChange={(value: number) => handleItemStatusChange(vm.item.item_id, 'current_stock', value)}
                    onReplenishmentCountChange={(value: number) => handleItemStatusChange(vm.item.item_id, 'replenishment_count', value)}
                    onMemoChange={(value: string) => handleItemStatusChange(vm.item.item_id, 'memo', value)}
                    onCheckChange={(value: boolean) => handleItemStatusChange(
                      vm.item.item_id,
                      'replenishment_status',
                      value ? getCode(REPLENISHMENT_STATUS, 'NOT_REQUIRED') : getCode(REPLENISHMENT_STATUS, 'REQUIRED')
                    )}
                    onNeedsRestockChange={(value: boolean) => handleItemStatusChange(
                      vm.item.item_id,
                      'replenishment_status',
                      value ? getCode(REPLENISHMENT_STATUS, 'REQUIRED') : getCode(REPLENISHMENT_STATUS, 'NOT_REQUIRED')
                    )}
                    onOrderRequest={(checked: boolean) =>
                      handleItemStatusChange(
                        vm.item.item_id,
                        'order_status',
                        checked
                          ? getCode(ORDER_REQUEST_STATUS, 'REQUIRED')
                          : getCode(ORDER_REQUEST_STATUS, 'NOT_REQUIRED')
                      )
                    }
                    onPreparationStatusChange={(value: EnumCode<typeof PREPARATION_STATUS>) => handleItemStatusChange(vm.item.item_id, 'preparation_status', value)}
                  />
                );
              })}
          </div>
        )}
      </div>
    </AutoSaveWrapper>
  );
} 