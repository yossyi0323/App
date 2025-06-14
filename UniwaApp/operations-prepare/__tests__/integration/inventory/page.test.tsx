import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InventoryPage from '@/app/inventory/page';
import { getPlaces, getItemsByDestination, getInventoryStatusByDate } from '@/lib/db-service';
import { LABELS } from '@/lib/constants/labels';
import { PLACE_TYPE, INVENTORY_STATUS, REPLENISHMENT_STATUS } from '@/lib/schemas/enums';
import { getCode } from '@/lib/utils/enum-utils';

// モックの設定
jest.mock('@/lib/db-service', () => ({
  getPlaces: jest.fn(),
  getItemsByDestination: jest.fn(),
  getInventoryStatusByDate: jest.fn(),
}));

describe('InventoryPage', () => {
  const mockPlaces = [
    {
      place_id: '1',
      place_name: 'テスト場所1',
      place_type: getCode(PLACE_TYPE, 'DESTINATION'),
      created_at: '2024-03-19T00:00:00Z',
      updated_at: '2024-03-19T00:00:00Z',
    },
  ];

  const mockItems = [
    {
      item_id: '1',
      item_name: 'テスト品目1',
      created_at: '2024-03-19T00:00:00Z',
      updated_at: '2024-03-19T00:00:00Z',
    },
  ];

  const mockStatuses = [
    {
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
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getPlaces as jest.Mock).mockResolvedValue({ data: mockPlaces, error: null });
    (getItemsByDestination as jest.Mock).mockResolvedValue({ data: mockItems, error: null });
    (getInventoryStatusByDate as jest.Mock).mockResolvedValue({ data: mockStatuses, error: null });
  });

  it('初期表示時に場所一覧が読み込まれる', async () => {
    render(<InventoryPage />);

    await waitFor(() => {
      expect(getPlaces).toHaveBeenCalled();
    });

    expect(screen.getByText('テスト場所1')).toBeInTheDocument();
  });

  it('場所を選択すると品目一覧が読み込まれる', async () => {
    render(<InventoryPage />);

    await waitFor(() => {
      expect(getPlaces).toHaveBeenCalled();
    });

    // 場所を選択
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    const option = screen.getByText('テスト場所1');
    fireEvent.click(option);

    await waitFor(() => {
      expect(getItemsByDestination).toHaveBeenCalledWith('1');
      expect(getInventoryStatusByDate).toHaveBeenCalled();
    });

    expect(screen.getByText('テスト品目1')).toBeInTheDocument();
  });

  it('日付を変更すると品目一覧が再読み込みされる', async () => {
    render(<InventoryPage />);

    await waitFor(() => {
      expect(getPlaces).toHaveBeenCalled();
    });

    // 場所を選択
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    const option = screen.getByText('テスト場所1');
    fireEvent.click(option);

    // 日付を変更
    const dateInput = screen.getByLabelText(LABELS.BUSINESS_DATE);
    fireEvent.change(dateInput, { target: { value: '2024-03-21' } });

    await waitFor(() => {
      expect(getInventoryStatusByDate).toHaveBeenCalledWith('2024-03-21');
    });
  });

  it('エラー発生時にエラーメッセージが表示される', async () => {
    (getPlaces as jest.Mock).mockResolvedValue({ data: null, error: new Error('テストエラー') });

    render(<InventoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/テストエラー/)).toBeInTheDocument();
    });
  });

  it('一括操作が正しく動作する', async () => {
    render(<InventoryPage />);

    await waitFor(() => {
      expect(getPlaces).toHaveBeenCalled();
    });

    // 場所を選択
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    const option = screen.getByText('テスト場所1');
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByText('テスト品目1')).toBeInTheDocument();
    });

    // 一括確認ボタンをクリック
    const checkAllButton = screen.getByText(LABELS.MARK_ALL_CHECKED);
    fireEvent.click(checkAllButton);

    // 一括補充ボタンをクリック
    const restockAllButton = screen.getByText(LABELS.MARK_ALL_NEEDS_RESTOCK);
    fireEvent.click(restockAllButton);

    await waitFor(() => {
      expect(screen.getByText(LABELS.CONFIRMED)).toBeInTheDocument();
      expect(screen.getByText(LABELS.NEEDS_RESTOCK)).toBeInTheDocument();
    });
  });

  it('ステータスバッジが正しく表示される', async () => {
    render(<InventoryPage />);

    await waitFor(() => {
      expect(getPlaces).toHaveBeenCalled();
    });

    // 場所を選択
    const select = screen.getByRole('combobox');
    fireEvent.click(select);
    const option = screen.getByText('テスト場所1');
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByText(LABELS.UNCONFIRMED)).toBeInTheDocument();
    });
  });
});
