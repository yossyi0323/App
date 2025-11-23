import axios from 'axios';
import type { InventoryStatus } from '@/types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 409) {
      throw new Error(
        'データが他のユーザーによって更新されました。ページを再読み込みしてください。'
      );
    }
    return Promise.reject(error);
  }
);

export const inventoryStatusApi = {
  getByDate: (businessDate: string): Promise<InventoryStatus[]> =>
    api.get('/inventory-status', { params: { businessDate } }).then((res) => res.data),

  getById: (id: string): Promise<InventoryStatus> =>
    api.get(`/inventory-status/${id}`).then((res) => res.data),

  saveBulk: async (statuses: InventoryStatus[]): Promise<void> => {
    await api.post('/inventory-status/bulk', statuses);
  },

  save: async (status: InventoryStatus): Promise<InventoryStatus> => {
    if (status.id) {
      return api.put(`/inventory-status/${status.id}`, status).then((res) => res.data);
    } else {
      return api.post('/inventory-status', status).then((res) => res.data);
    }
  },

  create: (inventoryStatus: Partial<InventoryStatus>): Promise<InventoryStatus> =>
    api.post('/inventory-status', inventoryStatus).then((res) => res.data),

  update: (id: string, inventoryStatus: Partial<InventoryStatus>): Promise<InventoryStatus> =>
    api.put(`/inventory-status/${id}`, inventoryStatus).then((res) => res.data),

  delete: (id: string): Promise<void> =>
    api.delete(`/inventory-status/${id}`).then(() => undefined),
};
