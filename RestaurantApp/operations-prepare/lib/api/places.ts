import type { GetPlacesResponse } from '@/lib/types/api/places';
import { callApi } from '@/lib/utils/api-client';
import { API_ENDPOINTS } from '@/lib/constants/api-endpoints';

export const placesApi = {
  getAll: async (): Promise<GetPlacesResponse> => {
    return callApi<GetPlacesResponse>(API_ENDPOINTS.PLACES, { method: 'GET' });
  },
};
