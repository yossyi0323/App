import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Inventory } from '@/app/inventory/page';
import { useInventoryStatus } from '@/hooks/useInventoryStatus';
import { usePlaces } from '@/hooks/usePlaces';
import { useItems } from '@/hooks/useItems';

// モックの設定
jest.mock('@/hooks/useInventoryStatus');
jest.mock('@/hooks/usePlaces');
jest.mock('@/hooks/useItems');

const mockUseInventoryStatus = useInventoryStatus as jest.Mock;
const mockUsePlaces = usePlaces as jest.Mock;
const mockUseItems = useItems as jest.Mock;

describe('在庫確認画面', () => {
  // テストデータ
  const mockPlaces = [
    { place_id: '1', place_name: 'テスト補充先1', place_type: 'DESTINATION' },
    { place_id: '2', place_name: 'テスト補充先2', place_type: 'DESTINATION' },
  ];

  const mockItems = [
    {
      item_id: '1',
      item_name: 'テスト品目1',
      created_at: '2024-03-19T00:00:00Z',
      updated_at: '2024-03-19T00:00:00Z',
    },
    {
      item_id: '2',
      item_name: 'テスト品目2',
      created_at: '2024-03-19T00:00:00Z',
      updated_at: '2024-03-19T00:00:00Z',
    },
  ];

  const mockInventoryStatus = {
    '1': {
      inventory_count: 0,
      replenishment_count: 0,
      inventory_status: 'UNCHECKED',
      replenishment_status: 'NOT_NEEDED',
      memo: '',
    },
  };

  beforeEach(() => {
    // モックの初期化
    mockUsePlaces.mockReturnValue({
      places: mockPlaces,
      isLoading: false,
      error: null,
    });

    mockUseItems.mockReturnValue({
      items: mockItems,
      isLoading: false,
      error: null,
    });

    mockUseInventoryStatus.mockReturnValue({
      inventoryStatus: mockInventoryStatus,
      isLoading: false,
      error: null,
      updateInventoryStatus: jest.fn(),
      saveInventoryStatus: jest.fn(),
    });

    // LocalStorageのクリア
    localStorage.clear();
  });

  describe('補充先選択機能', () => {
    test('補充先が選択されていない場合、Infoメッセージが表示される', () => {
      render(<Inventory />);
      expect(screen.getByText('補充先を選択してください')).toBeInTheDocument();
    });

    test('補充先を選択すると、該当する品物が表示される', async () => {
      render(<Inventory />);
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '1' } });

      await waitFor(() => {
        expect(screen.getByText('テスト品目1')).toBeInTheDocument();
      });
    });

    test('補充先を変更すると、変更前の入力値が保存される', async () => {
      const { updateInventoryStatus } = mockUseInventoryStatus();
      render(<Inventory />);

      // 最初の補充先を選択
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '1' } });

      // 在庫数を入力
      const inventoryInput = screen.getByLabelText('在庫数');
      fireEvent.change(inventoryInput, { target: { value: '5' } });

      // 補充先を変更
      fireEvent.change(select, { target: { value: '2' } });

      await waitFor(() => {
        expect(updateInventoryStatus).toHaveBeenCalledWith('1', {
          inventory_count: 5,
          replenishment_count: 0,
          inventory_status: 'UNCHECKED',
          replenishment_status: 'NOT_NEEDED',
          memo: '',
        });
      });
    });
  });

  describe('品物カードの基本機能', () => {
    test('品物カードに必要な要素が表示される', async () => {
      render(<Inventory />);
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '1' } });

      await waitFor(() => {
        expect(screen.getByText('テスト品目1')).toBeInTheDocument();
        expect(screen.getByLabelText('在庫数')).toBeInTheDocument();
        expect(screen.getByLabelText('補充数')).toBeInTheDocument();
        expect(screen.getByLabelText('補充ステータス')).toBeInTheDocument();
      });
    });

    test('在庫数の入力が正しく保存される', async () => {
      const { updateInventoryStatus } = mockUseInventoryStatus();
      render(<Inventory />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '1' } });

      const inventoryInput = screen.getByLabelText('在庫数');
      fireEvent.change(inventoryInput, { target: { value: '10' } });

      await waitFor(() => {
        expect(updateInventoryStatus).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            inventory_count: 10,
          })
        );
      });
    });

    test('補充数が1以上の場合、補充ステータスが自動で「要補充」になる', async () => {
      const { updateInventoryStatus } = mockUseInventoryStatus();
      render(<Inventory />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '1' } });

      const replenishmentInput = screen.getByLabelText('補充数');
      fireEvent.change(replenishmentInput, { target: { value: '5' } });

      await waitFor(() => {
        expect(updateInventoryStatus).toHaveBeenCalledWith(
          '1',
          expect.objectContaining({
            replenishment_count: 5,
            replenishment_status: 'NEEDED',
          })
        );
      });
    });
  });

  describe('自動保存機能', () => {
    test('入力欄からカーソルが外れた時に保存される', async () => {
      const { saveInventoryStatus } = mockUseInventoryStatus();
      render(<Inventory />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '1' } });

      const inventoryInput = screen.getByLabelText('在庫数');
      fireEvent.change(inventoryInput, { target: { value: '10' } });
      fireEvent.blur(inventoryInput);

      await waitFor(() => {
        expect(saveInventoryStatus).toHaveBeenCalled();
      });
    });

    test('5秒間入力がない場合に保存される', async () => {
      jest.useFakeTimers();
      const { saveInventoryStatus } = mockUseInventoryStatus();
      render(<Inventory />);

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '1' } });

      const inventoryInput = screen.getByLabelText('在庫数');
      fireEvent.change(inventoryInput, { target: { value: '10' } });

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(saveInventoryStatus).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });
  });
});
