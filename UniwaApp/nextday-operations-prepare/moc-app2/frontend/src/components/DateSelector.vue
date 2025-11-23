<template>

  <div class="flex items-center gap-2 mb-4">
     <Button
      variant="outline"
      size="icon"
      @click="handlePrevDay"
      class="h-9 w-9"
      > <ChevronLeft class="h-4 w-4" /> <span class="sr-only">前日</span> </Button
    > <Popover
      :open="open"
      @update:open="(value) => (open = value)"
      > <PopoverTrigger as-child
        > <Button
          variant="outline"
          :class="
            cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )
          "
          > <CalendarIcon class="mr-2 h-4 w-4" /> {{
            selectedDate ? format(selectedDate, 'PPP (EEEE)', { locale: ja }) : '日付を選択'
          }} </Button
        > </PopoverTrigger
      > <PopoverContent
        class="w-auto p-0"
        align="start"
        > <Calendar
          :selected="selectedDate"
          @select="handleDateSelect"
        /> </PopoverContent
      > </Popover
    > <Button
      variant="outline"
      size="icon"
      @click="handleNextDay"
      class="h-9 w-9"
      > <ChevronRight class="h-4 w-4" /> <span class="sr-only">翌日</span> </Button
    >
  </div>

</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { format, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import Button from '@/components/ui/button.vue';
import Popover from '@/components/ui/popover.vue';
import PopoverTrigger from '@/components/ui/popover-trigger.vue';
import PopoverContent from '@/components/ui/popover-content.vue';
import Calendar from '@/components/ui/calendar.vue';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  date: Date;
}

const props = defineProps<DateSelectorProps>();

const emit = defineEmits<{
  (e: 'onDateChange', date: Date): void;
}>();

const selectedDate = ref<Date>(props.date);
const open = ref(false);

watch(
  () => props.date,
  (newDate) => {
    selectedDate.value = newDate;
  }
);

const handleDateSelect = (newDate: Date | undefined) => {
  if (newDate) {
    selectedDate.value = newDate;
    emit('onDateChange', newDate);
    open.value = false;
  }
};

const handlePrevDay = () => {
  const prevDay = addDays(selectedDate.value, -1);
  selectedDate.value = prevDay;
  emit('onDateChange', prevDay);
};

const handleNextDay = () => {
  const nextDay = addDays(selectedDate.value, 1);
  selectedDate.value = nextDay;
  emit('onDateChange', nextDay);
};
</script>

