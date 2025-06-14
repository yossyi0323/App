export const PREPARATION_STATUS = {
  categoryCode: '04',
  categoryDisplayName: '作成ステータス',
  categoryLogicalName: 'PREPARATION_STATUS',
  values: [
    { code: '99', displayName: '作成不要', logicalName: 'NOT_REQUIRED' },
    { code: '01', displayName: '要作成', logicalName: 'REQUIRED' },
    { code: '02', displayName: '作成済', logicalName: 'COMPLETED' },
    { code: '03', displayName: '依頼済', logicalName: 'REQUESTED' },
  ],
} as const;
export type PreparationStatusCode = (typeof PREPARATION_STATUS.values)[number]['code'];
