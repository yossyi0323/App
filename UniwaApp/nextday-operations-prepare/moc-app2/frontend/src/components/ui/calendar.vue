<template>

  <div :class="cn('p-3', className)">

    <div class="flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0">

      <div class="space-y-4">

        <div class="flex justify-center pt-1 relative items-center">
           <button
            type="button"
            :class="
              cn(
                buttonVariants({ variant: 'outline' }),
                'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1'
              )
            "
            @click="prevMonth"
          >
             <ChevronLeft class="h-4 w-4" /> </button
          >
          <div class="text-sm font-medium">{{ currentMonthLabel }}</div>
           <button
            type="button"
            :class="
              cn(
                buttonVariants({ variant: 'outline' }),
                'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1'
              )
            "
            @click="nextMonth"
          >
             <ChevronRight class="h-4 w-4" /> </button
          >
        </div>

        <div class="w-full border-collapse space-y-1">

          <div class="flex">

            <div
              v-for="day in weekDays"
              :key="day"
              class="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]"
            >
               {{ day }}
            </div>

          </div>

          <div
            v-for="(week, weekIndex) in calendarWeeks"
            :key="weekIndex"
            class="flex w-full mt-2"
          >

            <div
              v-for="(day, dayIndex) in week"
              :key="dayIndex"
              class="h-9 w-9 text-center text-sm p-0 relative"
            >
               <button
                type="button"
                :class="
                  cn(
                    buttonVariants({ variant: 'ghost' }),
                    'h-9 w-9 p-0 font-normal',
                    isSelected(day) &&
                      'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                    isToday(day) && !isSelected(day) && 'bg-accent text-accent-foreground',
                    !isCurrentMonth(day) && 'text-muted-foreground opacity-50',
                    isSelected(day) && 'opacity-100'
                  )
                "
                @click="selectDate(day)"
                :disabled="!day"
              >
                 {{ day ? day.getDate() : '' }} </button
              >
            </div>

          </div>

        </div>

      </div>

    </div>

  </div>

</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isToday as isTodayDate,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
// buttonVariantsはcvaを使用
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  }
);
import { cn } from '@/lib/utils';

interface CalendarProps {
  selected?: Date;
  className?: string;
  locale?: Locale;
}

const props = withDefaults(defineProps<CalendarProps>(), {
  locale: () => ja,
});

const emit = defineEmits<{
  (e: 'select', date: Date): void;
}>();

const currentMonth = ref<Date>(props.selected ? new Date(props.selected) : new Date());
const selectedDate = ref<Date | undefined>(props.selected ? new Date(props.selected) : undefined);

watch(
  () => props.selected,
  (newDate) => {
    if (newDate) {
      selectedDate.value = new Date(newDate);
      currentMonth.value = new Date(newDate);
    }
  }
);

const currentMonthLabel = computed(() =>
  format(currentMonth.value, 'yyyy年M月', { locale: props.locale })
);
const weekDays = computed(() => ['日', '月', '火', '水', '木', '金', '土']);

const calendarWeeks = computed(() => {
  const monthStart = startOfMonth(currentMonth.value);
  const monthEnd = endOfMonth(currentMonth.value);
  const calendarStart = startOfWeek(monthStart, { locale: props.locale });
  const calendarEnd = endOfWeek(monthEnd, { locale: props.locale });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
});

const isSelected = (day: Date | null) => {
  if (!day || !selectedDate.value) return false;
  return isSameDay(day, selectedDate.value);
};

const isToday = (day: Date | null) => {
  if (!day) return false;
  return isTodayDate(day);
};

const isCurrentMonth = (day: Date | null) => {
  if (!day) return false;
  return isSameMonth(day, currentMonth.value);
};

const prevMonth = () => {
  currentMonth.value = subMonths(currentMonth.value, 1);
};

const nextMonth = () => {
  currentMonth.value = addMonths(currentMonth.value, 1);
};

const selectDate = (day: Date | null) => {
  if (!day) return;
  selectedDate.value = day;
  emit('select', day);
};
</script>

