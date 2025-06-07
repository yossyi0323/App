export const PLACE_TYPE = {
  categoryCode: '01',
  categoryDisplayName: '場所区分',
  categoryLogicalName: 'PLACE_TYPE',
  values: [
    { code: '01', displayName: '補充先', logicalName: 'DESTINATION' },
    { code: '02', displayName: '補充元', logicalName: 'SOURCE' }
  ]
} as const;
export type PlaceTypeCode = typeof PLACE_TYPE.values[number]['code']; 