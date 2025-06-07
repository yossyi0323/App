import { INVENTORY_STATUS } from '@/lib/schemas/enums/inventory-status';
import { isEnumCode, getCode } from '@/lib/utils/enum-utils';
import type { InventoryStatusViewModel, InventoryStatus } from '@/lib/types';

// InventoryStatus[]またはInventoryStatusViewModel[]から件数を集計
export function getStatusCounts(
  items: { status?: InventoryStatus | null }[] | InventoryStatus[]
) {
  let unconfirmed = 0, confirmed = 0, notRequired = 0;
  items.forEach((item: any) => {
    const checkStatus = (item.status?.check_status ?? item.check_status) || getCode(INVENTORY_STATUS, 'UNCONFIRMED');
    if (isEnumCode(INVENTORY_STATUS, checkStatus, 'UNCONFIRMED')) unconfirmed++;
    else if (isEnumCode(INVENTORY_STATUS, checkStatus, 'CONFIRMED')) confirmed++;
    else if (isEnumCode(INVENTORY_STATUS, checkStatus, 'NOT_REQUIRED')) notRequired++;
  });
  return { unconfirmed, confirmed, notRequired };
} 