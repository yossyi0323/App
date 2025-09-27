import axios from 'axios'
import type { Place, InventoryStatus, Reservation, ReservationStatus } from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// Place API
export const placeApi = {
  getAll: (): Promise<Place[]> =>
    api.get('/places').then(res => res.data),
  
  getByType: (type: string): Promise<Place[]> =>
    api.get(`/places/type/${type}`).then(res => res.data),
  
  getSource: (): Promise<Place[]> =>
    api.get('/places/source').then(res => res.data),
  
  getDestination: (): Promise<Place[]> =>
    api.get('/places/destination').then(res => res.data),
  
  create: (place: Partial<Place>): Promise<Place> =>
    api.post('/places', place).then(res => res.data),
  
  update: (id: string, place: Partial<Place>): Promise<Place> =>
    api.put(`/places/${id}`, place).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/places/${id}`).then(() => undefined)
}

// Inventory Status API
export const inventoryStatusApi = {
  getByDate: (businessDate: string): Promise<InventoryStatus[]> =>
    api.get('/inventory-status', { params: { businessDate } }).then(res => res.data),
  
  getByDateAndDestination: (businessDate: string, destinationId: string): Promise<InventoryStatus[]> =>
    api.get(`/inventory-status/destination/${destinationId}`, { params: { businessDate } }).then(res => res.data),
  
  getByDateAndSource: (businessDate: string, sourceId: string): Promise<InventoryStatus[]> =>
    api.get(`/inventory-status/source/${sourceId}`, { params: { businessDate } }).then(res => res.data),
  
  getPending: (businessDate: string): Promise<InventoryStatus[]> =>
    api.get('/inventory-status/pending', { params: { businessDate } }).then(res => res.data),
  
  getByDateAndItem: (businessDate: string, itemId: string): Promise<InventoryStatus | null> =>
    api.get(`/inventory-status/item/${itemId}`, { params: { businessDate } }).then(res => res.data),
  
  create: (inventoryStatus: Partial<InventoryStatus>): Promise<InventoryStatus> =>
    api.post('/inventory-status', inventoryStatus).then(res => res.data),
  
  update: (id: string, inventoryStatus: Partial<InventoryStatus>): Promise<InventoryStatus> =>
    api.put(`/inventory-status/${id}`, inventoryStatus).then(res => res.data),
  
  saveBatch: (inventoryStatuses: Partial<InventoryStatus>[]): Promise<InventoryStatus[]> =>
    api.post('/inventory-status/batch', inventoryStatuses).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/inventory-status/${id}`).then(() => undefined)
}

// Reservation API (今後実装予定)
export const reservationApi = {
  getByDate: (businessDate: string): Promise<Reservation[]> =>
    api.get('/reservations', { params: { businessDate } }).then(res => res.data),
  
  create: (reservation: Partial<Reservation>): Promise<Reservation> =>
    api.post('/reservations', reservation).then(res => res.data),
  
  update: (id: string, reservation: Partial<Reservation>): Promise<Reservation> =>
    api.put(`/reservations/${id}`, reservation).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/reservations/${id}`).then(() => undefined)
}

// Reservation Status API (今後実装予定)
export const reservationStatusApi = {
  getByDate: (businessDate: string): Promise<ReservationStatus | null> =>
    api.get('/reservation-status', { params: { businessDate } }).then(res => res.data),
  
  create: (reservationStatus: Partial<ReservationStatus>): Promise<ReservationStatus> =>
    api.post('/reservation-status', reservationStatus).then(res => res.data),
  
  update: (id: string, reservationStatus: Partial<ReservationStatus>): Promise<ReservationStatus> =>
    api.put(`/reservation-status/${id}`, reservationStatus).then(res => res.data)
}

export default api
