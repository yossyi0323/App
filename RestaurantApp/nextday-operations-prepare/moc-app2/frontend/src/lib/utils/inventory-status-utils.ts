import type { InventoryStatus, Item, InventoryStatusViewModel } from '@/types';
import { getCode } from '@/lib/utils/enum-utils';
import { INVENTORY_STATUS } from '@/lib/enums/inventory-status';
import { REPLENISHMENT_STATUS } from '@/lib/enums/replenishment-status';
import { PREPARATION_STATUS } from '@/lib/enums/preparation-status';
import { ORDER_REQUEST_STATUS } from '@/lib/enums/order-request-status';
import { format } from 'date-fns';

/**
 * ViewModelからInventoryStatusを生成する
 */
export function createInventoryStatusFromViewModel(
  viewModel: InventoryStatusViewModel,
  selectedDate: Date,
  options?: Partial<InventoryStatus>
): InventoryStatus {
  const currentStatus: Partial<InventoryStatus> = viewModel.status ?? {};

  return {
    id: currentStatus.id ?? '',
    businessDate: currentStatus.businessDate ?? format(selectedDate, 'yyyy-MM-dd'),
    itemId: currentStatus.itemId ?? viewModel.item.id,
    item: viewModel.item,
    preparationStatus:
      currentStatus.preparationStatus ?? getCode(PREPARATION_STATUS, 'NOT_REQUIRED'),
    orderRequestStatus:
      currentStatus.orderRequestStatus ?? getCode(ORDER_REQUEST_STATUS, 'NOT_REQUIRED'),
    inventoryCount: currentStatus.inventoryCount ?? 0,
    replenishmentCount: currentStatus.replenishmentCount ?? 0,
    replenishmentNote: currentStatus.replenishmentNote ?? '',
    version: currentStatus.version ?? 0,
    createdAt: currentStatus.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    replenishmentStatus:
      currentStatus.replenishmentStatus ?? getCode(REPLENISHMENT_STATUS, 'NOT_REQUIRED'),
    inventoryCheckStatus:
      currentStatus.inventoryCheckStatus ?? getCode(INVENTORY_STATUS, 'UNCONFIRMED'),
    ...(options ?? {}),
  };
}

/**
 * 差分抽出ユーティリティ: 前回保存時と異なるInventoryStatusのみ返す
 */
export function getDirtyInventoryStatuses(
  prev: InventoryStatus[],
  next: InventoryStatus[]
): InventoryStatus[] {
  return next.filter((nextStatus) => {
    const prevStatus = prev.find(
      (p) =>
        (p.itemId === nextStatus.itemId || p.item?.id === nextStatus.itemId) &&
        p.businessDate === nextStatus.businessDate
    );
    if (!prevStatus) return true;
    // itemを除外して比較
    const { item: _, ...prevWithoutItem } = prevStatus;
    const { item: __, ...nextWithoutItem } = nextStatus;
    return JSON.stringify(prevWithoutItem) !== JSON.stringify(nextWithoutItem);
  });
}
