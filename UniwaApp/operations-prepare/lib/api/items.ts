import type { GetItemsResponse } from '@/lib/types/api/items';
import { callApi } from '@/lib/utils/api-client';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';

export const itemsApi = {
  getAll: async (): Promise<GetItemsResponse> => {
    return callApi<GetItemsResponse>(API_ENDPOINTS.ITEMS, { method: 'GET' });
  },
  getByDestination: async (destinationId: string): Promise<GetItemsResponse> => {
    const url = `${API_ENDPOINTS.ITEMS}?destinationId=${encodeURIComponent(destinationId)}` as any;
    return callApi<GetItemsResponse>(url, { method: 'GET' });
  },
  getBySource: async (sourceId: string): Promise<GetItemsResponse> => {
    const url = `${API_ENDPOINTS.ITEMS}?sourceId=${encodeURIComponent(sourceId)}` as any;
    return callApi<GetItemsResponse>(url, { method: 'GET' });
  },
  getByPlace: async (placeId: string): Promise<GetItemsResponse> => {
    const url = `${API_ENDPOINTS.ITEMS}?placeId=${encodeURIComponent(placeId)}` as any;
    return callApi<GetItemsResponse>(url, { method: 'GET' });
  },
};
