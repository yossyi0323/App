import type { Item } from '@/lib/types';

export type GetItemsRequest = {
  destinationId?: string;
  sourceId?: string;
  placeId?: string;
};

export type GetItemsResponse = Item[];
