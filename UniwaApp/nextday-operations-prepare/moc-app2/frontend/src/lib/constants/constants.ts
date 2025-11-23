export const STORAGE_KEY_PREFIX = {
  INVENTORY: 'inventory',
  REPLENISHMENT: 'replenishment',
  CREATION: 'creation',
  ORDER: 'order',
} as const;

export const SYMBOLS = {
  COLON: ':',
  SLASH: '/',
} as const;

export const ALL_SOURCE_PLACES = {
  KEY: '__all_source_places__',
  LABEL: '全補充元',
} as const;

export const NUMBER_PLACEHOLDER = {
  STOCK: '0',
  RESTOCK: '0',
} as const;
