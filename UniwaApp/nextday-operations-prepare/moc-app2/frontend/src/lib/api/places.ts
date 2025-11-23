import axios from 'axios';
import type { Place } from '@/types';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const placesApi = {
  getAll: (): Promise<Place[]> => api.get('/places').then((res) => res.data),

  getByType: (type: string): Promise<Place[]> =>
    api.get(`/places/type/${type}`).then((res) => res.data),

  getSource: (): Promise<Place[]> => api.get('/places/source').then((res) => res.data),

  getDestination: (): Promise<Place[]> => api.get('/places/destination').then((res) => res.data),
};
