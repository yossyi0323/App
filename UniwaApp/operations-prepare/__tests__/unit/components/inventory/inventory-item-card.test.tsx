import { render, screen, fireEvent } from '@testing-library/react';
import { InventoryItemCard } from '@/components/inventory/inventory-item-card';
import { LABELS } from '@/lib/constants/labels';

const defaultProps = {
  item: {
    item_id: '1',
    item_name: 'テスト商品',
    created_at: '2024-03-19T00:00:00Z',
    updated_at: '2024-03-19T00:00:00Z'
  },
  date: '2024-03-20',
  currentStock: 0,
  restockAmount: 0,
  replenishmentStatus: 'not-required' as const,
  memo: '',
  onStockChange: jest.fn(),
  onRestockChange: jest.fn(),
  onNeedsRestockChange: jest.fn(),
  onMemoChange: jest.fn()
};

describe('InventoryItemCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('品物情報が正しく表示される', () => {
    render(<InventoryItemCard {...defaultProps} />);
    expect(screen.getByText('テスト商品')).toBeInTheDocument();
    expect(screen.getByLabelText(LABELS.CURRENT_STOCK)).toBeInTheDocument();
    expect(screen.getByLabelText(LABELS.REPLENISHMENT_COUNT)).toBeInTheDocument();
  });

  it('在庫数入力が正しく動作する', () => {
    render(<InventoryItemCard {...defaultProps} />);
    const input = screen.getByLabelText(LABELS.CURRENT_STOCK);

    // 正の値を入力
    fireEvent.change(input, { target: { value: '10' } });
    expect(defaultProps.onStockChange).toHaveBeenCalledWith(10);

    // 負の値を入力
    fireEvent.change(input, { target: { value: '-5' } });
    expect(defaultProps.onStockChange).toHaveBeenCalledWith(-5);

    // 空の値を入力
    fireEvent.change(input, { target: { value: '' } });
    expect(defaultProps.onStockChange).toHaveBeenCalledWith(0);
  });

  it('補充数入力が正しく動作する', () => {
    render(<InventoryItemCard {...defaultProps} />);
    const input = screen.getByLabelText(LABELS.REPLENISHMENT_COUNT);

    // 正の値を入力
    fireEvent.change(input, { target: { value: '5' } });
    expect(defaultProps.onRestockChange).toHaveBeenCalledWith(5);

    // 負の値を入力
    fireEvent.change(input, { target: { value: '-3' } });
    expect(defaultProps.onRestockChange).toHaveBeenCalledWith(-3);

    // 空の値を入力
    fireEvent.change(input, { target: { value: '' } });
    expect(defaultProps.onRestockChange).toHaveBeenCalledWith(0);
  });

  it('補充ステータスの切り替えが正しく動作する', () => {
    render(<InventoryItemCard {...defaultProps} />);
    const switchElement = screen.getByRole('switch');

    // 補充不要から要補充に切り替え
    fireEvent.click(switchElement);
    expect(defaultProps.onNeedsRestockChange).toHaveBeenCalledWith(true);

    // 要補充から補充不要に切り替え
    fireEvent.click(switchElement);
    expect(defaultProps.onNeedsRestockChange).toHaveBeenCalledWith(false);
  });

  it('メモ機能が正しく動作する', () => {
    render(<InventoryItemCard {...defaultProps} />);
    
    // メモを開く
    const memoButton = screen.getByLabelText(LABELS.TOGGLE_MEMO);
    fireEvent.click(memoButton);
    
    // メモを入力
    const memoInput = screen.getByLabelText(LABELS.MEMO);
    fireEvent.change(memoInput, { target: { value: 'テストメモ' } });
    expect(defaultProps.onMemoChange).toHaveBeenCalledWith('テストメモ');
  });

  it('補充済み状態では入力欄が無効化される', () => {
    render(<InventoryItemCard {...defaultProps} replenishmentStatus="restocked" />);
    
    const stockInput = screen.getByLabelText(LABELS.CURRENT_STOCK);
    const restockInput = screen.getByLabelText(LABELS.REPLENISHMENT_COUNT);
    const switchElement = screen.getByRole('switch');
    
    expect(stockInput).toBeDisabled();
    expect(restockInput).toBeDisabled();
    expect(switchElement).toBeDisabled();
  });

  it('補充ステータスに応じてラベルが正しく表示される', () => {
    const { rerender } = render(<InventoryItemCard {...defaultProps} />);
    expect(screen.getByText(LABELS.NO_RESTOCK)).toBeInTheDocument();
    
    rerender(<InventoryItemCard {...defaultProps} replenishmentStatus="needs-restock" />);
    expect(screen.getByText(LABELS.NEEDS_RESTOCK)).toBeInTheDocument();
  });
}); 