'use client';

import { useState, useEffect, useRef } from 'react';
import { DateSelector } from '@/components/date-selector';
import { InventoryItemCard } from '@/components/inventory/inventory-item-card';
import type { Item, InventoryStatus, InventoryStatusViewModel, Place } from '@/lib/types';
import { getCode, isEnumCode, EnumCode } from '@/lib/utils/enum-utils';
import { INVENTORY_STATUS } from '@/lib/schemas/enums/inventory-status';
import { REPLENISHMENT_STATUS } from '@/lib/schemas/enums/replenishment-status';
import { PREPARATION_STATUS } from '@/lib/schemas/enums/preparation-status';
import { ORDER_REQUEST_STATUS } from '@/lib/schemas/enums/order-request-status';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingIndicator } from '@/components/ui/LoadingIndicator';
import { MdCheck } from 'react-icons/md';
import { createInventoryStatusFromViewModel } from '@/lib/utils/inventory-status-utils';
import { LABELS } from '@/lib/constants/labels';
import { MESSAGES, $msg, ERROR } from '@/lib/constants/messages';
import { toEnumCode } from '@/lib/utils/enum-utils';
import { Badge } from '@/components/ui/badge';
import { useInventoryAutoSave } from '@/lib/utils/inventory-status-utils';
import { AutoSaveWrapper } from '@/components/common/auto-save-wrapper';
import { ALL_SOURCE_PLACES, STORAGE_KEY_PREFIX, SYMBOLS } from '@/lib/constants/constants';
import { getDateFromDateTime } from '@/lib/utils/date-time-utils';
import { getDisplayName } from '@/lib/utils/enum-utils';
import { OrderItemCard } from '@/components/order/order-item-card';
import { callApi } from '@/lib/utils/api-client';


export default function OrderPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [items, setItems] = useState<InventoryStatusViewModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const autoSaveRef = useInventoryAutoSave({
    items,
    selectedPlaceId: ALL_SOURCE_PLACES.KEY, // 全場所分取得
    selectedDate,
    setError,
    storageKeyPrefix: STORAGE_KEY_PREFIX.ORDER,
  });

  // 品目一覧の取得
  useEffect(() => {
    async function loadItems() {
      setIsLoading(true);
      try {
        const items = await callApi<Item[]>('/api/items');
        const date = getDateFromDateTime(selectedDate);
        const statuses = await callApi<InventoryStatus[]>(`/api/inventory-status?date=${date}`);
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
  }, [selectedDate]);

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

  return (
    <AutoSaveWrapper autoSaveManager={autoSaveRef.current}>
      <div>
        <h1 className="text-xl font-bold mb-4">{LABELS.ORDER_REQUEST}</h1>
        <DateSelector date={selectedDate} onDateChange={setSelectedDate} />
        {error && <ErrorMessage message={error} className="mb-4" />}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <LoadingIndicator />
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              {$msg(MESSAGES.I30020)}
            </p>
          </div>
        ) : (
          <div>
            {/* ヘッダー行 */}
            {(() => {
              // 件数集計
              const filtered = items.filter(vm => {
                const status = vm.status ? vm.status : createInventoryStatusFromViewModel(vm, selectedDate);
                return !isEnumCode(ORDER_REQUEST_STATUS, status.order_status, 'NOT_REQUIRED');
              });
              const countRequired = items.filter(vm => {
                const status = vm.status ? vm.status : createInventoryStatusFromViewModel(vm, selectedDate);
                return isEnumCode(ORDER_REQUEST_STATUS, status.order_status, 'REQUIRED');
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
                      {getDisplayName(ORDER_REQUEST_STATUS, 'REQUIRED')}{SYMBOLS.COLON}{countRequired}{SYMBOLS.SLASH}{total}
                    </Badge>
                  </div>
                  <span className="text-xs mr-7">{LABELS.ORDER_REQUEST}</span>
                </div>
              );
            })()}
            {/* 品目リスト */}
            {items
              .filter(vm => {
                const status = vm.status ? vm.status : createInventoryStatusFromViewModel(vm, selectedDate);
                // 発注依頼ステータスがNOT_REQUIRED以外（要発注依頼・発注依頼済）を表示
                return !isEnumCode(ORDER_REQUEST_STATUS, status.order_status, 'NOT_REQUIRED');
              })
              .map(vm => {
                const status = vm.status ? vm.status : createInventoryStatusFromViewModel(vm, selectedDate);
                return (
                  <OrderItemCard
                    key={vm.item.item_id}
                    item={vm.item}
                    currentStock={status.current_stock}
                    restockAmount={status.replenishment_count}
                    orderStatus={toEnumCode(ORDER_REQUEST_STATUS, status.order_status)}
                    memo={status.memo}
                    onMemoChange={v => handleItemStatusChange(vm.item.item_id, 'memo', v)}
                    onOrderRequestChange={v => handleItemStatusChange(
                      vm.item.item_id,
                      'order_status',
                      v
                        ? getCode(ORDER_REQUEST_STATUS, 'REQUESTED')
                        : getCode(ORDER_REQUEST_STATUS, 'REQUIRED')
                    )}
                  />
                );
              })}
          </div>
        )}
      </div>
    </AutoSaveWrapper>
  );
}