import type {
  SaveInventoryStatusRequest,
  SaveInventoryStatusResponse,
  GetInventoryStatusByDateResponse,
} from '@/lib/types/api/inventory-status';
import type { InventoryStatus } from '@/lib/types';
import { callApi } from '@/lib/utils/api-client';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';

export const inventoryStatusApi = {
  save: async (request: SaveInventoryStatusRequest): Promise<SaveInventoryStatusResponse> => {
    return callApi(API_ENDPOINTS.INVENTORY_STATUS, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  getByDate: async (date: string): Promise<GetInventoryStatusByDateResponse> => {
    const url = `${API_ENDPOINTS.INVENTORY_STATUS}?date=${encodeURIComponent(date)}` as any;
    return callApi<GetInventoryStatusByDateResponse>(url, { method: 'GET' });
  },
};
