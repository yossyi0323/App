'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Place } from '@/lib/types';
import { PLACE_TYPE } from '@/lib/schemas/enums/place-type';
import { getDisplayName, getLogicalName, isEnumCode, type EnumCode } from '@/lib/utils/enum-utils';

interface PlaceSelectorProps {
  places: Place[];
  selectedPlaceId: string | null;
  onPlaceChange: (placeId: string) => void;
  type: EnumCode<typeof PLACE_TYPE>;
  className?: string;
}

export function PlaceSelector({
  places,
  selectedPlaceId,
  onPlaceChange,
  type,
  className,
}: PlaceSelectorProps) {
  const filteredPlaces = places.filter((place) =>
    isEnumCode(PLACE_TYPE, place.place_type, getLogicalName(PLACE_TYPE, type))
  );

  const logicalName = getLogicalName(PLACE_TYPE, type);
  const placeholder = (logicalName ? getDisplayName(PLACE_TYPE, logicalName) : '') + 'を選択';

  return (
    <Select value={selectedPlaceId || ''} onValueChange={onPlaceChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {filteredPlaces.map((place) => (
          <SelectItem key={place.place_id} value={place.place_id}>
            {place.place_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
