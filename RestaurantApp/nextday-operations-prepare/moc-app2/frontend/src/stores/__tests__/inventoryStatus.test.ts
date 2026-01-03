import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useInventoryStatusStore } from '../inventoryStatus';
import { inventoryStatusApi } from '@/services/api';
import type { InventoryStatus } from '@/types';

vi.mock('@/services/api', () => ({
  inventoryStatusApi: {
    getByDate: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
}));

describe('InventoryStatusStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('should fetch inventory statuses by date', async () => {
    const store = useInventoryStatusStore();
    const mockStatuses: InventoryStatus[] = [
      {
        id: '1',
        businessDate: '2025-09-27',
        itemId: 'item1',
        inventoryCheckStatus: '未確認',
        replenishmentStatus: '要補充',
        preparationStatus: '作成不要',
        orderRequestStatus: '発注不要',
        version: 0,
        createdAt: '2025-09-27T00:00:00Z',
        updatedAt: '2025-09-27T00:00:00Z',
      },
    ];

    vi.mocked(inventoryStatusApi.getByDate).mockResolvedValue(mockStatuses);

    await store.fetchInventoryStatusByDate('2025-09-27');

    expect(store.inventoryStatuses).toEqual(mockStatuses);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    const store = useInventoryStatusStore();
    const error = new Error('Network error');

    vi.mocked(inventoryStatusApi.getByDate).mockRejectedValue(error);

    await expect(store.fetchInventoryStatusByDate('2025-09-27')).rejects.toThrow();
    expect(store.error).toBe('在庫状況データの取得に失敗しました');
    expect(store.loading).toBe(false);
  });

  it('should update inventory status', async () => {
    const store = useInventoryStatusStore();
    const existingStatus: InventoryStatus = {
      id: '1',
      businessDate: '2025-09-27',
      itemId: 'item1',
      inventoryCheckStatus: '未確認',
      replenishmentStatus: '要補充',
      preparationStatus: '作成不要',
      orderRequestStatus: '発注不要',
      version: 0,
      createdAt: '2025-09-27T00:00:00Z',
      updatedAt: '2025-09-27T00:00:00Z',
    };
    store.inventoryStatuses = [existingStatus];

    const updatedStatus: InventoryStatus = {
      ...existingStatus,
      replenishmentStatus: '補充済',
      version: 1,
    };

    vi.mocked(inventoryStatusApi.update).mockResolvedValue(updatedStatus);

    await store.updateInventoryStatus({ id: '1', replenishmentStatus: '補充済' });

    expect(store.inventoryStatuses[0].replenishmentStatus).toBe('補充済');
    expect(store.inventoryStatuses[0].version).toBe(1);
  });
});
