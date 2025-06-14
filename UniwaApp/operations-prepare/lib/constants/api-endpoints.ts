export const API_ENDPOINTS = {
  INVENTORY_STATUS: '/api/inventory-status',
  ITEMS: '/api/items',
  PLACES: '/api/places',
  // 必要に応じて他のAPIエンドポイントもここに追加
} as const;

export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
