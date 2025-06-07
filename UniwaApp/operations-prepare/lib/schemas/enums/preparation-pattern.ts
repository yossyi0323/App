export const PREPARATION_PATTERN = {
  categoryCode: '05',
  categoryDisplayName: '補充パターン',
  categoryLogicalName: 'PREPARATION_PATTERN',
  values: [
    { code: '01', displayName: '移動', logicalName: 'MOVE' },
    { code: '02', displayName: '作成', logicalName: 'CREATION' }
  ]
} as const;

export type PreparationPatternCode = typeof PREPARATION_PATTERN.values[number]['code']; 