export interface Place {
  id: string
  type: string // 補充元先区分
  name: string
  displayOrder?: number
  createdAt: string
  updatedAt: string
}

export interface Item {
  id: string
  name: string
  description?: string
  unit?: string
  createdAt: string
  updatedAt: string
}

export interface ItemReplenishment {
  id: string
  itemId: string
  sourceLocationId: string
  destinationLocationId: string
  replenishmentType: string // 補充パターン区分
  orderRequestDestination?: string // 作成・発注依頼先
  createdAt: string
  updatedAt: string
}

export interface ItemPreparation {
  id: string
  itemId: string
  locationId: string
  createdAt: string
  updatedAt: string
}

export interface InventoryStatus {
  id: string
  businessDate: string
  itemId: string
  inventoryCheckStatus: string // 在庫確認ステータス
  replenishmentStatus: string // 補充ステータス
  preparationStatus: string // 作成ステータス
  orderRequestStatus: string // 発注依頼ステータス
  inventoryCount?: number // 在庫数
  replenishmentCount?: number // 補充数
  replenishmentNote?: string // 補充メモ
  createdAt: string
  updatedAt: string
}

export interface Reservation {
  id: string
  businessDate: string
  productName: string // 商品名
  reservationCount: number // 予約数
  createdAt: string
  updatedAt: string
}

export interface ReservationStatus {
  id: string
  businessDate: string
  memo?: string // メモ
  createdAt: string
  updatedAt: string
}

// ステータス定数
export const INVENTORY_CHECK_STATUS = {
  PENDING: '未確認',
  CONFIRMED: '確認済',
  NOT_REQUIRED: '確認不要'
} as const

export const REPLENISHMENT_STATUS = {
  NOT_REQUIRED: '補充不要',
  REQUIRED: '要補充',
  COMPLETED: '補充済'
} as const

export const PREPARATION_STATUS = {
  NOT_REQUIRED: '作成不要',
  REQUIRED: '要作成',
  COMPLETED: '作成済',
  REQUESTED: '作成依頼済'
} as const

export const ORDER_REQUEST_STATUS = {
  NOT_REQUIRED: '発注不要',
  REQUIRED: '要発注依頼',
  COMPLETED: '発注依頼済'
} as const

export const PLACE_TYPE = {
  SOURCE: '補充元',
  DESTINATION: '補充先'
} as const

export const REPLENISHMENT_TYPE = {
  MOVE: '移動',
  CREATE: '作成'
} as const

// ===== Zodスキーマ定義 =====
import { z } from 'zod'

/**
 * 在庫ステータス入力のバリデーションスキーマ
 * 
 * このスキーマから型定義とバリデーションを自動生成します。
 * UIの制約仕様もここに集約することで、ドキュメント生成の基盤とします。
 */
export const InventoryStatusInputSchema = z.object({
  /**
   * 在庫数
   * - 制約: 0以上の整数
   * - UI: 数値キーボード
   * - 初期値: 0
   */
  inventoryCount: z.number()
    .int('在庫数は整数で入力してください')
    .min(0, '在庫数は0以上で入力してください')
    .default(0),
  
  /**
   * 補充数
   * - 制約: 0以上の整数
   * - UI: 数値キーボード
   * - 動作: 1以上の値を入力すると「要補充」が自動的にONになる
   * - 初期値: 0
   */
  replenishmentCount: z.number()
    .int('補充数は整数で入力してください')
    .min(0, '補充数は0以上で入力してください')
    .default(0),
  
  /**
   * 補充メモ
   * - 制約: 500文字以内
   * - UI: 複数行テキストエリア
   * - 任意項目
   */
  replenishmentNote: z.string()
    .max(500, 'メモは500文字以内で入力してください')
    .optional()
    .default(''),
  
  /**
   * 確認済フラグ
   * - 動作: ONにすると「確認不要」が自動的にOFFになる
   */
  isConfirmed: z.boolean().default(false),
  
  /**
   * 確認不要フラグ
   * - 動作: ONにすると「確認済」と「要補充」が自動的にOFFになる
   */
  isNotRequired: z.boolean().default(false),
  
  /**
   * 要補充フラグ
   * - 動作: ONにすると補充数が0の場合は自動的に1にセットされる
   */
  isReplenishmentRequired: z.boolean().default(false),
})

// Zodスキーマから型を自動生成
export type InventoryStatusInput = z.infer<typeof InventoryStatusInputSchema>