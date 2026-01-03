import { supabase } from './supabase-client';
import type {
  InventoryStatus,
  Item,
  ItemPreparation,
  Place,
  Reservation,
  ReservationStatus,
} from './types';
import { getCode } from './utils/enum-utils';
import { INVENTORY_STATUS } from './schemas/enums/inventory-status';
import { REPLENISHMENT_STATUS } from './schemas/enums/replenishment-status';
import { PREPARATION_STATUS } from './schemas/enums/preparation-status';
import { ORDER_REQUEST_STATUS } from './schemas/enums/order-request-status';

// Places
export async function getPlaces() {
  const { data, error } = await supabase.from('place').select('*');

  return { data, error };
}

// Items
export async function getItems() {
  // item_preparationからitem_id, preparation_typeを全件取得
  const { data, error } = await supabase
    .from('item_preparation')
    .select('item_id, preparation_type');

  if (error || !data) return { data: null, error };

  const itemIds = data.map((item) => item.item_id);
  const prepTypeMap = Object.fromEntries(data.map((item) => [item.item_id, item.preparation_type]));

  const { data: items, error: itemsError } = await supabase
    .from('item')
    .select('*')
    .in('item_id', itemIds);

  // item情報にpreparation_typeを付与して返す
  const itemsWithPattern = (items || []).map((item) => ({
    ...item,
    pattern_type: prepTypeMap[item.item_id] || null,
  }));

  return { data: itemsWithPattern, error: itemsError };
}

export async function getItemsByDestination(destinationId: string) {
  // item_preparationからitem_id, preparation_typeを取得
  const { data, error } = await supabase
    .from('item_preparation')
    .select('item_id, preparation_type')
    .eq('destination_place_id', destinationId);

  if (error || !data) return { data: null, error };

  const itemIds = data.map((item) => item.item_id);
  const prepTypeMap = Object.fromEntries(data.map((item) => [item.item_id, item.preparation_type]));

  const { data: items, error: itemsError } = await supabase
    .from('item')
    .select('*')
    .in('item_id', itemIds);

  // item情報にpreparation_typeを付与して返す
  const itemsWithPattern = (items || []).map((item) => ({
    ...item,
    pattern_type: prepTypeMap[item.item_id] || null,
  }));

  return { data: itemsWithPattern, error: itemsError };
}

export async function getItemsBySource(sourceId: string) {
  // item_preparationからitem_id, preparation_typeを取得
  const { data, error } = await supabase
    .from('item_preparation')
    .select('item_id, preparation_type')
    .eq('source_place_id', sourceId);

  if (error || !data) return { data: null, error };

  const itemIds = data.map((item) => item.item_id);
  const prepTypeMap = Object.fromEntries(data.map((item) => [item.item_id, item.preparation_type]));

  const { data: items, error: itemsError } = await supabase
    .from('item')
    .select('*')
    .in('item_id', itemIds);

  // item情報にpreparation_typeを付与して返す
  const itemsWithPattern = (items || []).map((item) => ({
    ...item,
    pattern_type: prepTypeMap[item.item_id] || null,
  }));

  return { data: itemsWithPattern, error: itemsError };
}

// Inventory Status
/**
 * 指定日付の在庫ステータスを取得し、存在しない場合は自動生成
 * @param date 業務日付
 */
export async function getInventoryStatusByDate(date: string) {
  // 既存の在庫ステータスを取得
  const { data: existingStatuses, error: fetchError } = await supabase
    .from('inventory_status')
    .select('*')
    .eq('business_date', date);

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  // 全商品を取得
  const { data: items, error: itemsError } = await supabase.from('item').select('item_id');

  if (itemsError) {
    return { data: null, error: itemsError };
  }

  // 存在しない商品の在庫ステータスを作成
  const missingStatuses =
    items
      ?.filter((item) => !existingStatuses?.some((status) => status.item_id === item.item_id))
      .map((item) => ({
        business_date: date,
        item_id: item.item_id,
        check_status: getCode(INVENTORY_STATUS, 'UNCONFIRMED'), // 未確認
        replenishment_status: getCode(REPLENISHMENT_STATUS, 'NOT_REQUIRED'), // 補充不要
        preparation_status: getCode(PREPARATION_STATUS, 'NOT_REQUIRED'), // 作成不要
        order_status: getCode(ORDER_REQUEST_STATUS, 'NOT_REQUIRED'), // 発注不要
        current_stock: null,
        replenishment_count: null,
        memo: null,
      })) || [];

  if (missingStatuses.length > 0) {
    // 新規作成
    const { data: newStatuses, error: insertError } = await supabase
      .from('inventory_status')
      .insert(missingStatuses)
      .select();

    if (insertError) {
      return { data: null, error: insertError };
    }

    // 既存のステータスと新規作成したステータスを結合
    return {
      data: [...(existingStatuses || []), ...(newStatuses || [])],
      error: null,
    };
  }

  return { data: existingStatuses, error: null };
}

export async function updateInventoryStatus(status: Partial<InventoryStatus>) {
  const { data, error } = await supabase
    .from('inventory_status')
    .upsert({
      business_date: status.business_date,
      item_id: status.item_id,
      check_status: status.check_status,
      replenishment_status: status.replenishment_status,
      preparation_status: status.preparation_status,
      order_status: status.order_status,
      current_stock: status.current_stock,
      replenishment_count: status.replenishment_count,
      memo: status.memo,
    })
    .select();

  return { data, error };
}

/**
 * 在庫補充状況管理テーブルを一括保存（upsert）する共通関数
 * @param statuses 保存対象の在庫補充状況配列
 * @returns {Promise<{ data: any, error: any }>}
 */
export async function saveInventoryStatusesBulk(statuses: Partial<InventoryStatus>[]) {
  if (!Array.isArray(statuses) || statuses.length === 0) return { data: null, error: null };
  const { data, error } = await supabase.from('inventory_status').upsert(statuses).select();
  return { data, error };
}

// Reservations
export async function getReservationsByDate(date: string) {
  const { data, error } = await supabase.from('reservation').select('*').eq('business_date', date);

  return { data, error };
}

export async function updateReservation(reservation: Reservation) {
  const { data, error } = await supabase
    .from('reservation')
    .upsert({
      business_date: reservation.business_date,
      product_name: reservation.product_name,
      reservation_count: reservation.reservation_count,
    })
    .select();

  return { data, error };
}

// Reservation Status
export async function getReservationStatusByDate(date: string) {
  const { data, error } = await supabase
    .from('reservation_status')
    .select('*')
    .eq('business_date', date)
    .single();

  return { data, error };
}

export async function updateReservationStatus(status: ReservationStatus) {
  const { data, error } = await supabase
    .from('reservation_status')
    .upsert({
      business_date: status.business_date,
      memo: status.memo,
    })
    .select();

  return { data, error };
}
