import type { InventoryStatus } from '@/lib/types';

export type SaveInventoryStatusRequest = {
  statuses: InventoryStatus[];
};

export type SaveInventoryStatusResponse = {
  success: boolean;
  savedCount: number;
};

export type GetInventoryStatusByDateResponse = InventoryStatus[];
