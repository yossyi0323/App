export const REPLENISHMENT_STATUS = {
  categoryCode: '03',
  categoryDisplayName: '補充ステータス',
  categoryLogicalName: 'REPLENISHMENT_STATUS',
  values: [
    { code: '99', displayName: '補充不要', logicalName: 'NOT_REQUIRED' },
    { code: '01', displayName: '要補充', logicalName: 'REQUIRED' },
    { code: '02', displayName: '補充済', logicalName: 'COMPLETED' }
  ]
} as const;

export type ReplenishmentStatusCode = typeof REPLENISHMENT_STATUS.values[number]['code']; 