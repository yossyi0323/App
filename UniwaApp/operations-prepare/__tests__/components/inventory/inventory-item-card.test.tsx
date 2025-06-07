import { render, screen, fireEvent } from '@testing-library/react';
import { InventoryItemCard } from '@/components/inventory/inventory-item-card';
import { LABELS } from '@/lib/constants/labels';
import '@testing-library/jest-dom';
import { REPLENISHMENT_STATUS } from '@/lib/schemas/enums/replenishment-status';

describe('InventoryItemCard', () => {
  const baseProps = {
    item: {
      item_id: '1',
      item_name: 'テスト品目',
      created_at: '2024-03-19T00:00:00Z',
      updated_at: '2024-03-19T00:00:00Z'
    },
    date: '2025-05-19',
    currentStock: 0,
    restockAmount: 0,
    replenishmentStatus: 'not-required' as 'not-required' | 'needs-restock' | 'restocked',
    memo: '',
    onStockChange: jest.fn(),
    onRestockChange: jest.fn(),
    onNeedsRestockChange: jest.fn(),
    onMemoChange: jest.fn(),
  };

  it('初期表示で値が正しい', () => {
    render(<InventoryItemCard {...baseProps} />);
    expect(screen.getByLabelText(LABELS.CURRENT_STOCK)).toHaveValue(0);
    expect(screen.getByLabelText(LABELS.REPLENISHMENT_COUNT)).toHaveValue(0);
    expect(screen.getByText(LABELS.NO_RESTOCK)).toBeInTheDocument();
  });

  it('補充済みなら全て非活性', () => {
    render(<InventoryItemCard {...baseProps} replenishmentStatus="restocked" />);
    expect(screen.getByLabelText(LABELS.CURRENT_STOCK)).toBeDisabled();
    expect(screen.getByLabelText(LABELS.REPLENISHMENT_COUNT)).toBeDisabled();
    expect(screen.getByText(LABELS.NEEDS_RESTOCK)).toBeInTheDocument();
  });

  it('入力イベントがコールバックされる', () => {
    render(<InventoryItemCard {...baseProps} />);
    fireEvent.change(screen.getByLabelText(LABELS.CURRENT_STOCK), { target: { value: 2 } });
    expect(baseProps.onStockChange).toHaveBeenCalledWith(2);
  });
}); 