// 基本型定義
export interface Place {
  id: string;
  type: string; // 補充元先区分（code）
  name: string;
  displayOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  unit?: string;
  patternType?: string; // 補充パターン（code）
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStatus {
  id: string;
  businessDate: string;
  itemId: string;
  item?: Item; // JOIN結果用
  inventoryCheckStatus: string; // 在庫確認ステータス（code）
  replenishmentStatus: string; // 補充ステータス（code）
  preparationStatus: string; // 作成ステータス（code）
  orderRequestStatus: string; // 発注依頼ステータス（code）
  inventoryCount?: number; // 在庫数
  replenishmentCount?: number; // 補充数
  replenishmentNote?: string; // 補充メモ
  version: number; // 楽観ロック用バージョン列
  createdAt: string;
  updatedAt: string;
}

// フィールド名のマッピング（snake_case ↔ camelCase）
export interface InventoryStatusSnakeCase {
  id: string;
  business_date: string;
  item_id: string;
  inventory_check_status: string;
  replenishment_status: string;
  preparation_status: string;
  order_request_status: string;
  inventory_count?: number;
  replenishment_count?: number;
  replenishment_note?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

// ViewModel型（operations-prepareから移植）
export interface InventoryStatusViewModel {
  item: Item;
  status: InventoryStatus | null;
}

// Zodスキーマ定義
import { z } from 'zod';

/**
 * 在庫ステータス入力のバリデーションスキーマ
 */
export const InventoryStatusInputSchema = z.object({
  inventoryCount: z
    .number()
    .int('在庫数は整数で入力してください')
    .min(0, '在庫数は0以上で入力してください')
    .default(0),

  replenishmentCount: z
    .number()
    .int('補充数は整数で入力してください')
    .min(0, '補充数は0以上で入力してください')
    .default(0),

  replenishmentNote: z
    .string()
    .max(500, 'メモは500文字以内で入力してください')
    .optional()
    .default(''),

  isConfirmed: z.boolean().default(false),

  isNotRequired: z.boolean().default(false),

  isReplenishmentRequired: z.boolean().default(false),
});

export type InventoryStatusInput = z.infer<typeof InventoryStatusInputSchema>;
