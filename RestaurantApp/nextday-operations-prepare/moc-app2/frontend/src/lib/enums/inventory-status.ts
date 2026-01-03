export const INVENTORY_STATUS = {
  categoryCode: '02',
  categoryDisplayName: '在庫確認ステータス',
  categoryLogicalName: 'INVENTORY_STATUS',
  values: [
    { code: '01', displayName: '未確認', logicalName: 'UNCONFIRMED' },
    { code: '03', displayName: '確認済', logicalName: 'CONFIRMED' },
    { code: '99', displayName: '確認不要', logicalName: 'NOT_REQUIRED' },
  ],
} as const;

export type InventoryStatusCode = (typeof INVENTORY_STATUS.values)[number]['code'];
