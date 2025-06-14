export type Place = {
  place_id: string;
  place_type: string;
  place_name: string;
  created_at: string;
  updated_at: string;
};

export type Item = {
  item_id: string;
  item_name: string;
  created_at: string;
  updated_at: string;
  pattern_type?: string | null;
};

export type ItemPreparation = {
  item_preparation_id: string;
  item_id: string;
  preparation_type: string;
  source_place_id: string;
  destination_place_id: string;
  preparation_contact: string;
  created_at: string;
  updated_at: string;
};

export type InventoryStatus = {
  inventory_status_id: string;
  business_date: string;
  item_id: string;
  check_status: string;
  replenishment_status: string;
  preparation_status: string;
  order_status: string;
  current_stock: number;
  replenishment_count: number;
  memo: string;
  created_at: string;
  updated_at: string;
};

export type Reservation = {
  reservation_id: string;
  business_date: string;
  product_name: string;
  reservation_count: number;
  created_at: string;
  updated_at: string;
};

export type ReservationStatus = {
  reservation_status_id: string;
  business_date: string;
  memo: string;
  created_at: string;
  updated_at: string;
};

// 画面表示用の型定義
export type InventoryStatusViewModel = {
  item: Item;
  status: InventoryStatus | null;
};
