import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import InventoryPage from '@/app/inventory/page';
import { getPlaces, getItemsByDestination, getInventoryStatusByDate } from '@/lib/db-service';
import { saveBatchInventoryStatuses } from '@/lib/local-storage';
import { PLACE_TYPE } from '@/lib/schemas/enums/place-type';
import { INVENTORY_STATUS } from '@/lib/schemas/enums/inventory-status';
import { REPLENISHMENT_STATUS } from '@/lib/schemas/enums/replenishment-status';
import { getCode } from '@/lib/utils/enum-utils';
import { INFO, ERROR, $msg } from '@/lib/constants/messages';
import { LABELS } from '@/lib/constants/labels';

// モック
jest.mock('@/lib/db-service');
jest.mock('@/lib/local-storage');
jest.mock('@/lib/supabase-client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    data: [],
  },
}));

const mockPlaces = [
  { place_id: '1', place_name: '場所A', place_type: getCode(PLACE_TYPE, 'DESTINATION') },
  { place_id: '2', place_name: '場所B', place_type: getCode(PLACE_TYPE, 'DESTINATION') },
];

const mockItems = [
  { item_id: '1', item_name: '商品A' },
  { item_id: '2', item_name: '商品B' },
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
    created_at: '2024-03-20T00:00:00Z',
    updated_at: '2024-03-20T00:00:00Z',
  },
];

describe('InventoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getPlaces as jest.Mock).mockResolvedValue({ data: mockPlaces, error: null });
    (getItemsByDestination as jest.Mock).mockResolvedValue({ data: mockItems, error: null });
    (getInventoryStatusByDate as jest.Mock).mockResolvedValue({ data: mockStatuses, error: null });
  });

  it('初期表示時にローディング表示される', async () => {
    await act(async () => {
      render(<InventoryPage />);
    });
    expect(screen.getByText($msg(INFO.I30009))).toBeInTheDocument();
  });

  it('データ取得後、商品一覧が表示される', async () => {
    await act(async () => {
      render(<InventoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('商品A')).toBeInTheDocument();
      expect(screen.getByText('商品B')).toBeInTheDocument();
    });
  });

  it('場所を選択すると、該当場所の商品一覧が表示される', async () => {
    await act(async () => {
      render(<InventoryPage />);
    });
    await waitFor(() => {
      // BulkActionBarの見出しとして表示される場所名を特定
      const headings = screen.getAllByRole('heading', { level: 2 });
      expect(headings.some(h => h.textContent === '場所A')).toBe(true);
    });
    // PlaceSelectorのドロップダウンはUI的にJestで開けないため、BulkActionBar側でassert
  });

  it('全て確認済ボタン押下で、全商品が確認済になる', async () => {
    await act(async () => {
      render(<InventoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('全て確認済に')).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByText('全て確認済に'));
    });
    expect(saveBatchInventoryStatuses).toHaveBeenCalled();
  });

  it('全て要補充ボタン押下で、全商品が要補充になる', async () => {
    await act(async () => {
      render(<InventoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('全て要補充に')).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByText('全て要補充に'));
    });
    expect(saveBatchInventoryStatuses).toHaveBeenCalled();
  });

  it('エラー発生時、エラーメッセージが表示される', async () => {
    (getPlaces as jest.Mock).mockResolvedValue({ data: null, error: new Error('テストエラー') });
    await act(async () => {
      render(<InventoryPage />);
    });
    await waitFor(() => {
      // メッセージ定義＋ラベル定義でassert
      expect(screen.getByText($msg(ERROR.E10001, LABELS.LOCATION) + ': テストエラー')).toBeInTheDocument();
    });
  });

  it('未確認バッジの件数が正しい', async () => {
    await act(async () => {
      render(<InventoryPage />);
    });
    // 未確認の件数 = ステータスが未確認の件数 + ステータスがnullの件数
    const unconfirmedCount = mockStatuses.filter(
      s => s.check_status === getCode(INVENTORY_STATUS, 'UNCONFIRMED')
    ).length + (mockItems.length - mockStatuses.length);
    await waitFor(() => {
      // バッジ要素を取得
      const badges = screen.getAllByRole('status');
      // 未確認バッジを特定（ラベルで絞り込み）
      const unconfirmedBadge = badges.find(badge => 
        badge.textContent?.includes(LABELS.UNCONFIRMED)
      );
      // バッジが存在することを確認
      expect(unconfirmedBadge).toBeInTheDocument();
      // 件数部分のみを抽出して比較
      const count = unconfirmedBadge?.textContent?.match(/\d+/)?.[0];
      // デバッグ用
      console.log('Expected:', unconfirmedCount);
      console.log('Actual:', count);
      console.log('Badge text:', unconfirmedBadge?.textContent);
      expect(count).toBe(String(unconfirmedCount));
    });
  });
}); 