import { supabase } from '@/lib/supabase-client';
import type { InventoryStatus, Item } from '@/lib/types';
import { saveInventoryStatusesBulk } from '@/lib/db-service';
import { getCode } from '@/lib/utils/enum-utils';
import type { EnumCode } from '@/lib/utils/enum-utils';
import { INVENTORY_STATUS } from '@/lib/schemas/enums/inventory-status';
import { REPLENISHMENT_STATUS } from '@/lib/schemas/enums/replenishment-status';

export type InventoryStatusViewModel = {
  item: Item;
  status: InventoryStatus | null;
};

/**
 * ViewModelからInventoryStatusを生成する
 * 入力値（viewModel.status）を優先し、未設定の場合はデフォルト値を使用
 */
export function createInventoryStatusFromViewModel(
  viewModel: InventoryStatusViewModel,
  selectedDate: Date,
  options?: Partial<InventoryStatus>
): InventoryStatus {
  const currentStatus: Partial<InventoryStatus> = viewModel.status ?? {};
  
  return {
    // 必須フィールド
    inventory_status_id: currentStatus.inventory_status_id ?? '',
    business_date: currentStatus.business_date ?? selectedDate.toISOString().split('T')[0],
    item_id: currentStatus.item_id ?? viewModel.item.item_id,
    
    // 状態フィールド
    preparation_status: currentStatus.preparation_status ?? 'not-required',
    order_status: currentStatus.order_status ?? 'not-required',
    current_stock: currentStatus.current_stock ?? 0,
    replenishment_count: currentStatus.replenishment_count ?? 0,
    memo: currentStatus.memo ?? '',
    
    // システムフィールド
    created_at: currentStatus.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
    
    // ステータスコード
    replenishment_status: currentStatus.replenishment_status ?? getCode(REPLENISHMENT_STATUS, 'NOT_REQUIRED'),
    check_status: currentStatus.check_status ?? getCode(INVENTORY_STATUS, 'UNCONFIRMED'),
    
    // オプションで上書き可能
    ...(options ?? {})
  };
}

/**
 * ViewModelの配列を一括更新
 */
export function updateViewModels(
  viewModels: InventoryStatusViewModel[],
  selectedDate: Date,
  options: {
    itemId?: string;
    field?: keyof InventoryStatus;
    value?: any;
  } = {}
): InventoryStatusViewModel[] {
  return viewModels.map(viewModel => {
    // 特定のアイテムのみ更新する場合
    if (options.itemId && viewModel.item.item_id !== options.itemId) {
      return viewModel;
    }

    return {
      ...viewModel,
      status: createInventoryStatusFromViewModel(
        viewModel,
        selectedDate,
        options.field ? { [options.field]: options.value } : undefined
      )
    };
  });
}

/**
 * InventoryStatusViewModel[]やnull混在配列も受け付けて、InventoryStatusだけを抽出して保存するラッパー関数
 * 差分抽出・保存・保存後の最新statuses返却まで一元化
 * @param viewModels InventoryStatusViewModel[]または({ status: InventoryStatus | null }[])型
 * @param prevStatuses 前回保存時のInventoryStatus[]
 * @returns {Promise<{ data: any, error: any, savedStatuses: InventoryStatus[] }>}
 */
export async function saveInventoryStatusViewModels(viewModels: { status: InventoryStatus | null }[], prevStatuses: InventoryStatus[] = []) {
  const statuses = viewModels
    .map(vm => vm.status)
    .filter((status): status is InventoryStatus => !!status);
  // 差分抽出
  const dirtyStatuses = getDirtyInventoryStatuses(prevStatuses, statuses);
  const result = await saveInventoryStatusesBulk(dirtyStatuses);
  // 保存成功時のみ最新statusesを返す
  return { ...result, savedStatuses: result.error ? prevStatuses : statuses };
}

/**
 * 差分抽出ユーティリティ: 前回保存時と異なるInventoryStatusのみ返す
 */
export function getDirtyInventoryStatuses(prev: InventoryStatus[], next: InventoryStatus[]): InventoryStatus[] {
  return next.filter(nextStatus => {
    const prevStatus = prev.find(p => p.item_id === nextStatus.item_id && p.business_date === nextStatus.business_date);
    return !prevStatus || JSON.stringify(prevStatus) !== JSON.stringify(nextStatus);
  });
} 