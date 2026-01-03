<template>
   <Select
    :model-value="selectedPlaceId || ''"
    @update:model-value="handlePlaceChange"
    > <SelectTrigger :class="className"> <SelectValue :placeholder="placeholder" /> </SelectTrigger>
    <SelectContent
      > <SelectItem
        v-for="place in filteredPlaces"
        :key="place.id"
        :value="place.id"
        > {{ place.name }} </SelectItem
      > </SelectContent
    > </Select
  >
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Select from '@/components/ui/select.vue';
import SelectContent from '@/components/ui/select-content.vue';
import SelectItem from '@/components/ui/select-item.vue';
import SelectTrigger from '@/components/ui/select-trigger.vue';
import SelectValue from '@/components/ui/select-value.vue';
import type { Place } from '@/types';
import { PLACE_TYPE } from '@/lib/enums/place-type';
import { getDisplayName, getLogicalName, isEnumCode, type EnumCode } from '@/lib/utils/enum-utils';
import { LABELS } from '@/lib/constants/labels';

interface PlaceSelectorProps {
  places: Place[];
  selectedPlaceId: string | null;
  type: EnumCode<typeof PLACE_TYPE>;
  className?: string;
}

const props = defineProps<PlaceSelectorProps>();

const emit = defineEmits<{
  'update:selectedPlaceId': [placeId: string];
}>();

const filteredPlaces = computed(() =>
  props.places.filter((place) =>
    isEnumCode(PLACE_TYPE, place.type, getLogicalName(PLACE_TYPE, props.type))
  )
);

const logicalName = computed(() => getLogicalName(PLACE_TYPE, props.type));
const placeholder = computed(() =>
  logicalName.value ? getDisplayName(PLACE_TYPE, logicalName.value) + 'を選択' : ''
);

const handlePlaceChange = (placeId: string) => {
  emit('update:selectedPlaceId', placeId);
};
</script>

