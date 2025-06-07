// 共通定数管理ファイル
// ラベルやメッセージ以外の固定値はここで一元管理

export const NUMBER_PLACEHOLDER = {
  STOCK: '0',
  RESTOCK: '0',
};

export const AUTOSAVE = {
  DEBOUNCE_MS: 2000,
};

export const SYMBOLS = {
  COLON: '：',
  SLASH: '/',
  SPACE: ' '
} as const;

export const STORAGE_KEY_PREFIX = {
  INVENTORY: 'inventory',
  REPLENISHMENT: 'replenishment',
  CREATION: 'creation',
  // 必要に応じて他の用途もここに追加
} as const;

export const ALL_SOURCE_PLACES = {
  KEY: 'all-source-places',
  LABEL: '全て',
} as const; 