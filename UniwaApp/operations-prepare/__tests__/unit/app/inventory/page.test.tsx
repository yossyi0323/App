import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import InventoryPage from '@/app/inventory/page';
import { getPlaces, getItemsByDestination, getInventoryStatusByDate } from '@/lib/db-service';
import { ERROR, INFO, $msg } from '@/lib/constants/messages';
import { LABELS } from '@/lib/constants/labels';
import { PLACE_TYPE } from '@/lib/schemas/enums/place-type';
import { getCode } from '@/lib/utils/enum-utils';

// db-serviceのモック
jest.mock('@/lib/db-service', () => ({
  getPlaces: jest.fn(),
  getItemsByDestination: jest.fn(),
  getInventoryStatusByDate: jest.fn(),
}));

describe('InventoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期表示時にローディングメッセージが表示される', async () => {
    (getPlaces as jest.Mock).mockResolvedValue({ data: null, error: null });

    await act(async () => {
      render(<InventoryPage />);
    });

    expect(screen.getByText($msg(INFO.I30009))).toBeInTheDocument();
  });

  it('エラー時にエラーメッセージが表示される', async () => {
    (getPlaces as jest.Mock).mockResolvedValue({
      data: null,
      error: new Error('テストエラー'),
    });

    await act(async () => {
      render(<InventoryPage />);
    });

    await waitFor(() => {
      expect(
        screen.getByText($msg(ERROR.E10001, LABELS.LOCATION) + ': テストエラー')
      ).toBeInTheDocument();
    });
  });

  it('データ取得後に在庫確認画面が表示される', async () => {
    const mockPlaces = [
      {
        place_id: '1',
        place_name: '冷蔵庫',
        place_type: getCode(PLACE_TYPE, 'DESTINATION'),
        created_at: '2024-03-19T00:00:00Z',
        updated_at: '2024-03-19T00:00:00Z',
      },
    ];

    const mockItems = [
      {
        item_id: '1',
        item_name: 'テスト商品',
        created_at: '2024-03-19T00:00:00Z',
        updated_at: '2024-03-19T00:00:00Z',
      },
    ];

    const mockStatuses = [
      {
        inventory_status_id: '1',
        business_date: '2024-03-20',
        item_id: '1',
        check_status: 'UNCONFIRMED',
        replenishment_status: 'NOT_REQUIRED',
        preparation_status: 'not-required',
        order_status: 'not-required',
        current_stock: 0,
        replenishment_count: 0,
        memo: '',
        created_at: '2024-03-19T00:00:00Z',
        updated_at: '2024-03-19T00:00:00Z',
      },
    ];

    (getPlaces as jest.Mock).mockResolvedValue({ data: mockPlaces, error: null });
    (getItemsByDestination as jest.Mock).mockResolvedValue({ data: mockItems, error: null });
    (getInventoryStatusByDate as jest.Mock).mockResolvedValue({ data: mockStatuses, error: null });

    await act(async () => {
      render(<InventoryPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('テスト商品')).toBeInTheDocument();
      expect(screen.getByText('冷蔵庫')).toBeInTheDocument();
    });
  });
});
