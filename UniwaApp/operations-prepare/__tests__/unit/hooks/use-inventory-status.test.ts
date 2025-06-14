import { renderHook, act } from '@testing-library/react';
import { useInventoryStatus } from '@/lib/hooks/use-inventory-status';
import { saveBatchInventoryStatuses } from '@/lib/local-storage';
import { INVENTORY_STATUS, REPLENISHMENT_STATUS } from '@/lib/schemas/enums';
import { getCode } from '@/lib/utils/enum-utils';

// モックの設定
jest.mock('@/lib/local-storage', () => ({
  saveBatchInventoryStatuses: jest.fn(),
}));

describe('useInventoryStatus', () => {
  const mockItem = {
    item_id: '1',
    item_name: 'テスト品目',
    created_at: '2024-03-19T00:00:00Z',
    updated_at: '2024-03-19T00:00:00Z',
  };

  const mockStatus = {
    inventory_status_id: '1',
    business_date: '2024-03-20',
    item_id: '1',
    check_status: getCode(INVENTORY_STATUS, 'UNCONFIRMED'),
    replenishment_status: getCode(REPLENISHMENT_STATUS, 'NOT_REQUIRED'),
    preparation_status: 'not-required',
    order_status: 'not-required',
    current_stock: 0,
    replenishment_count: 0,
    memo: '',
    created_at: '2024-03-19T00:00:00Z',
    updated_at: '2024-03-19T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useInventoryStatus(mockItem, '2024-03-20', mockStatus));

    expect(result.current.currentStock).toBe(0);
    expect(result.current.restockAmount).toBe(0);
    expect(result.current.replenishmentStatus).toBe('not-required');
    expect(result.current.memo).toBe('');
  });

  it('在庫数の更新が正しく動作する', () => {
    const { result } = renderHook(() => useInventoryStatus(mockItem, '2024-03-20', mockStatus));

    act(() => {
      result.current.handleStockChange(10);
    });

    expect(result.current.currentStock).toBe(10);
    expect(saveBatchInventoryStatuses).toHaveBeenCalled();
  });

  it('補充数の更新が正しく動作する', () => {
    const { result } = renderHook(() => useInventoryStatus(mockItem, '2024-03-20', mockStatus));

    act(() => {
      result.current.handleRestockChange(5);
    });

    expect(result.current.restockAmount).toBe(5);
    expect(saveBatchInventoryStatuses).toHaveBeenCalled();
  });

  it('補充ステータスの更新が正しく動作する', () => {
    const { result } = renderHook(() => useInventoryStatus(mockItem, '2024-03-20', mockStatus));

    act(() => {
      result.current.handleNeedsRestockChange(true);
    });

    expect(result.current.replenishmentStatus).toBe('needs-restock');
    expect(saveBatchInventoryStatuses).toHaveBeenCalled();
  });

  it('メモの更新が正しく動作する', () => {
    const { result } = renderHook(() => useInventoryStatus(mockItem, '2024-03-20', mockStatus));

    act(() => {
      result.current.handleMemoChange('テストメモ');
    });

    expect(result.current.memo).toBe('テストメモ');
    expect(saveBatchInventoryStatuses).toHaveBeenCalled();
  });

  it('在庫数が1以上の場合、確認済みステータスになる', () => {
    const { result } = renderHook(() => useInventoryStatus(mockItem, '2024-03-20', mockStatus));

    act(() => {
      result.current.handleStockChange(1);
    });

    expect(result.current.checkStatus).toBe('checked');
  });

  it('補充数が1以上の場合、確認済みステータスになる', () => {
    const { result } = renderHook(() => useInventoryStatus(mockItem, '2024-03-20', mockStatus));

    act(() => {
      result.current.handleRestockChange(1);
    });

    expect(result.current.checkStatus).toBe('checked');
  });

  it('補充ステータスがneeds-restockの場合、確認済みステータスになる', () => {
    const { result } = renderHook(() => useInventoryStatus(mockItem, '2024-03-20', mockStatus));

    act(() => {
      result.current.handleNeedsRestockChange(true);
    });

    expect(result.current.checkStatus).toBe('checked');
  });

  it('全ての値が0で補充不要の場合、未確認ステータスになる', () => {
    const { result } = renderHook(() => useInventoryStatus(mockItem, '2024-03-20', mockStatus));

    act(() => {
      result.current.handleStockChange(0);
      result.current.handleRestockChange(0);
      result.current.handleNeedsRestockChange(false);
    });

    expect(result.current.checkStatus).toBe('unchecked');
  });
});
