import type { InventoryStatus } from '@/lib/types';
import { callApi } from '@/lib/utils/api-client';

export type SaveInventoryStatusRequest = {
  statuses: InventoryStatus[];
};

export type SaveInventoryStatusResponse = {
  success: boolean;
  savedCount: number;
};

export const inventoryStatusApi = {
  save: async (request: SaveInventoryStatusRequest): Promise<SaveInventoryStatusResponse> => {
    return callApi('/api/inventory-status', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};
