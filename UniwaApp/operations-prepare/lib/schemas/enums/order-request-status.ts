export const ORDER_REQUEST_STATUS = {
  categoryCode: '05',
  categoryDisplayName: '発注依頼ステータス',
  categoryLogicalName: 'ORDER_REQUEST_STATUS',
  values: [
    { code: '99', displayName: '発注不要', logicalName: 'NOT_REQUIRED' },
    { code: '01', displayName: '要発注', logicalName: 'REQUIRED' },
    { code: '02', displayName: '発注依頼済', logicalName: 'REQUESTED' }
  ]
} as const;
export type OrderRequestStatusCode = typeof ORDER_REQUEST_STATUS.values[number]['code']; 