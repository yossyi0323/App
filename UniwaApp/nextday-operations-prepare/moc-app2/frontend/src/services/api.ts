import axios from 'axios';
import type { Place, InventoryStatus } from '@/types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 409) {
      // 楽観ロックエラー
      throw new Error(
        'データが他のユーザーによって更新されました。ページを再読み込みしてください。'
      );
    }
    return Promise.reject(error);
  }
);

// Place API
export const placeApi = {
  getAll: (): Promise<Place[]> => api.get('/places').then((res) => res.data),

  getByType: (type: string): Promise<Place[]> =>
    api.get(`/places/type/${type}`).then((res) => res.data),

  getSource: (): Promise<Place[]> => api.get('/places/source').then((res) => res.data),

  getDestination: (): Promise<Place[]> => api.get('/places/destination').then((res) => res.data),
};

// Inventory Status API
export const inventoryStatusApi = {
  getByDate: (businessDate: string): Promise<InventoryStatus[]> =>
    api.get('/inventory-status', { params: { businessDate } }).then((res) => res.data),

  getById: (id: string): Promise<InventoryStatus> =>
    api.get(`/inventory-status/${id}`).then((res) => res.data),

  create: (inventoryStatus: Partial<InventoryStatus>): Promise<InventoryStatus> =>
    api.post('/inventory-status', inventoryStatus).then((res) => res.data),

  update: (id: string, inventoryStatus: Partial<InventoryStatus>): Promise<InventoryStatus> =>
    api.put(`/inventory-status/${id}`, inventoryStatus).then((res) => res.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/inventory-status/${id}`).then(() => undefined),
};

export default api;
