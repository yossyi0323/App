import axios, { AxiosError } from 'axios';
import type { Item } from '@/types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// エラーハンドリング用のヘルパー
const handleError = (error: AxiosError | Error): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message || 'Unknown error';
    const status = error.response?.status || 0;
    throw new Error(`${message} (Status: ${status})`);
  }
  throw error;
};

export const itemsApi = {
  getAll: (): Promise<Item[]> =>
    api
      .get('/items')
      .then((res) => {
        console.log('Items loaded:', res.data);
        return res.data;
      })
      .catch(handleError),

  getByPlace: (placeId: string): Promise<Item[]> =>
    api
      .get(`/items?placeId=${placeId}`)
      .then((res) => res.data)
      .catch(handleError),

  getByDestination: (destinationId: string): Promise<Item[]> =>
    api
      .get(`/items?destinationId=${destinationId}`)
      .then((res) => res.data)
      .catch(handleError),

  getBySource: (sourceId: string): Promise<Item[]> =>
    api
      .get(`/items?sourceId=${sourceId}`)
      .then((res) => res.data)
      .catch(handleError),
};
