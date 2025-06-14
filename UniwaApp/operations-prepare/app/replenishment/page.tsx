'use client';

import { useState, useEffect, useRef } from 'react';
import { DateSelector } from '@/components/date-selector';
import { PlaceSelector } from '@/components/inventory/place-selector';
import type { Place, InventoryStatus, InventoryStatusViewModel, Item } from '@/lib/types';
import { PLACE_TYPE } from '@/lib/schemas/enums/place-type';
import {
  getCode,
  isEnumCode,
  EnumCode,
  getCodeAsEnumCode,
  getLogicalName,
  getDisplayName,
} from '@/lib/utils/enum-utils';
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
import { Badge } from '@/components/ui/badge';
import { useInventoryAutoSave } from '@/lib/utils/inventory-status-utils';
import { AutoSaveWrapper } from '@/components/common/auto-save-wrapper';
import { STORAGE_KEY_PREFIX, SYMBOLS } from '@/lib/constants/constants';
import { getDateFromDateTime } from '@/lib/utils/date-time-utils';
import { callApi } from '@/lib/utils/api-client';
import { useBusinessDate } from '@/lib/contexts/BusinessDateContext';
import { formatDate, parseDate } from '@/lib/utils/date-time-utils';
import { itemsApi } from '@/lib/api/items';
import { inventoryStatusApi } from '@/lib/api/inventory-status';
import { placesApi } from '@/lib/api/places';
import {
  SaveInventoryStatusRequest,
  SaveInventoryStatusResponse,
} from '@/lib/types/api/inventory-status';

export default function ReplenishmentPage() {
  const { businessDate, setBusinessDate } = useBusinessDate();
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [items, setItems] = useState<InventoryStatusViewModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const autoSaveRef = useInventoryAutoSave({
    items,
    selectedPlaceId,
    selectedDate: parseDate(businessDate),
    setError,
    storageKeyPrefix: STORAGE_KEY_PREFIX.REPLENISHMENT,
  });

  const placeType = getCode(PLACE_TYPE, 'SOURCE');

  // 場所一覧の取得
  useEffect(() => {
    async function loadPlaces() {
      try {
        const data = await placesApi.getAll();
        if (data) {
          setPlaces(data);
          const firstSource = data.find((place) => place.place_type === placeType);
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
        const items = await itemsApi.getBySource(selectedPlaceId!);
        const statuses = await inventoryStatusApi.getByDate(businessDate);
        const viewModels =
          items?.map((item) => ({
            item,
            status: statuses?.find((status) => status.item_id === item.item_id) || null,
          })) || [];
        setItems(viewModels);
      } catch (err: any) {
        setError($msg(ERROR.E10001, LABELS.ITEM) + (err?.message ? `: ${err.message}` : ''));
      } finally {
        setIsLoading(false);
      }
    }
    loadItems();
  }, [selectedPlaceId, businessDate]);

  // ステータス更新
  const handleItemStatusChange = (
    itemId: string,
    field: keyof InventoryStatus,
    value: InventoryStatus[keyof InventoryStatus]
  ) => {
    setItems((prev) =>
      prev.map((vm) => {
        if (vm.item.item_id !== itemId) return vm;
        return {
          ...vm,
          status: createInventoryStatusFromViewModel(vm, parseDate(businessDate), {
            [field]: value,
          }),
        };
      })
    );
  };

  const handlePlaceChange = (placeId: string) => {
    setSelectedPlaceId(placeId);
  };

  const handleDateChange = (date: Date) => {
    setBusinessDate(formatDate(date));
  };

  return (
    <AutoSaveWrapper<InventoryStatus[], SaveInventoryStatusRequest, SaveInventoryStatusResponse>
      autoSaveManager={autoSaveRef.current}
    >
      <div>
        <h1 className="text-xl font-bold mb-4">{LABELS.REPLENISHMENT}</h1>
        <DateSelector date={parseDate(businessDate)} onDateChange={handleDateChange} />
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
              {selectedPlaceId ? $msg(MESSAGES.W20010) : $msg(MESSAGES.I30020)}
            </p>
          </div>
        ) : (
          <div>
            {/* ヘッダー行 */}
            {(() => {
              // 件数集計
              const filtered = items.filter((vm) => {
                const patternType = vm.item.pattern_type
                  ? toEnumCode(PREPARATION_PATTERN, vm.item.pattern_type)
                  : undefined;
                const isMove = patternType && isEnumCode(PREPARATION_PATTERN, patternType, 'MOVE');
                const status = vm.status
                  ? vm.status
                  : createInventoryStatusFromViewModel(vm, parseDate(businessDate));
                const replenishmentStatus = getCodeAsEnumCode(
                  REPLENISHMENT_STATUS,
                  getLogicalName(REPLENISHMENT_STATUS, status.replenishment_status)
                );
                const isTargetStatus =
                  isEnumCode(REPLENISHMENT_STATUS, replenishmentStatus, 'REQUIRED') ||
                  isEnumCode(REPLENISHMENT_STATUS, replenishmentStatus, 'COMPLETED');
                return isMove && isTargetStatus;
              });
              const countRequired = filtered.filter((vm) => {
                const status = vm.status
                  ? vm.status
                  : createInventoryStatusFromViewModel(vm, parseDate(businessDate));
                const replenishmentStatus = getCodeAsEnumCode(
                  REPLENISHMENT_STATUS,
                  getLogicalName(REPLENISHMENT_STATUS, status.replenishment_status)
                );
                return isEnumCode(REPLENISHMENT_STATUS, replenishmentStatus, 'REQUIRED');
              }).length;
              const total = filtered.length;
              const allCleared = countRequired === 0 || total === 0;
              return (
                <div className="flex items-center px-2 py-2 border-b border-border text-sm mb-2 justify-between">
                  <div className="flex gap-2 ml-2">
                    <Badge
                      variant={allCleared ? 'secondary' : 'default'}
                      className="text-xs font-normal px-2 py-0.5 align-middle"
                    >
                      {getDisplayName(REPLENISHMENT_STATUS, 'REQUIRED')}
                      {SYMBOLS.COLON}
                      {countRequired}
                      {SYMBOLS.SLASH}
                      {total}
                    </Badge>
                  </div>
                  <span className="text-xs mr-10">{LABELS.REPLENISHMENT}</span>
                </div>
              );
            })()}
            {items
              .filter((vm) => {
                // 補充パターン区分が「移動」
                const patternType = vm.item.pattern_type
                  ? toEnumCode(PREPARATION_PATTERN, vm.item.pattern_type)
                  : undefined;
                const isMove = patternType && isEnumCode(PREPARATION_PATTERN, patternType, 'MOVE');
                // 補充ステータスが「要補充」または「補充済」
                const status = vm.status
                  ? vm.status
                  : createInventoryStatusFromViewModel(vm, parseDate(businessDate));
                const replenishmentStatus = getCodeAsEnumCode(
                  REPLENISHMENT_STATUS,
                  getLogicalName(REPLENISHMENT_STATUS, status.replenishment_status)
                );
                const isTargetStatus =
                  isEnumCode(REPLENISHMENT_STATUS, replenishmentStatus, 'REQUIRED') ||
                  isEnumCode(REPLENISHMENT_STATUS, replenishmentStatus, 'COMPLETED');
                return isMove && isTargetStatus;
              })
              .map((vm) => {
                const status = vm.status
                  ? vm.status
                  : createInventoryStatusFromViewModel(vm, parseDate(businessDate));
                return (
                  <ReplenishItemCard
                    key={vm.item.item_id}
                    item={vm.item}
                    date={businessDate}
                    currentStock={status.current_stock}
                    restockAmount={status.replenishment_count}
                    replenishmentStatus={getCodeAsEnumCode(
                      REPLENISHMENT_STATUS,
                      getLogicalName(REPLENISHMENT_STATUS, status.replenishment_status)
                    )}
                    preparationStatus={getCodeAsEnumCode(
                      PREPARATION_STATUS,
                      getLogicalName(PREPARATION_STATUS, status.preparation_status)
                    )}
                    orderStatus={getCodeAsEnumCode(
                      ORDER_REQUEST_STATUS,
                      getLogicalName(ORDER_REQUEST_STATUS, status.order_status)
                    )}
                    memo={status.memo}
                    isChecked={isEnumCode(INVENTORY_STATUS, status.check_status, 'CONFIRMED')}
                    patternType={
                      vm.item.pattern_type
                        ? toEnumCode(PREPARATION_PATTERN, vm.item.pattern_type)
                        : undefined
                    }
                    onStockChange={(v) =>
                      handleItemStatusChange(vm.item.item_id, 'current_stock', v)
                    }
                    onRestockChange={(v) =>
                      handleItemStatusChange(vm.item.item_id, 'replenishment_count', v)
                    }
                    onMemoChange={(v) => handleItemStatusChange(vm.item.item_id, 'memo', v)}
                    onCheckChange={(v) =>
                      handleItemStatusChange(
                        vm.item.item_id,
                        'check_status',
                        v
                          ? getCodeAsEnumCode(INVENTORY_STATUS, 'CONFIRMED')
                          : getCodeAsEnumCode(INVENTORY_STATUS, 'UNCONFIRMED')
                      )
                    }
                    onOrderRequest={() =>
                      handleItemStatusChange(
                        vm.item.item_id,
                        'order_status',
                        isEnumCode(ORDER_REQUEST_STATUS, status.order_status, 'NOT_REQUIRED')
                          ? getCodeAsEnumCode(ORDER_REQUEST_STATUS, 'REQUIRED')
                          : getCodeAsEnumCode(ORDER_REQUEST_STATUS, 'NOT_REQUIRED')
                      )
                    }
                    onPreparationStatusChange={(v) =>
                      handleItemStatusChange(vm.item.item_id, 'preparation_status', v)
                    }
                    onNeedsRestockChange={(v) =>
                      handleItemStatusChange(
                        vm.item.item_id,
                        'replenishment_status',
                        v
                          ? getCodeAsEnumCode(REPLENISHMENT_STATUS, 'REQUIRED')
                          : getCodeAsEnumCode(REPLENISHMENT_STATUS, 'COMPLETED')
                      )
                    }
                  />
                );
              })}
          </div>
        )}
      </div>
    </AutoSaveWrapper>
  );
}
