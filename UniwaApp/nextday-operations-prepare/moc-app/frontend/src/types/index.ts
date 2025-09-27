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
