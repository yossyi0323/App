'use client';

import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { LABELS } from '@/lib/constants/labels';

interface DateSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelector({ date, onDateChange }: DateSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(date);
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate);
      onDateChange(newDate);
      setOpen(false);
    }
  };

  const handlePrevDay = () => {
    const prevDay = addDays(selectedDate, -1);
    setSelectedDate(prevDay);
    onDateChange(prevDay);
  };

  const handleNextDay = () => {
    const nextDay = addDays(selectedDate, 1);
    setSelectedDate(nextDay);
    onDateChange(nextDay);
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevDay}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">{LABELS.DATE_SELECTOR.PREV_DAY}</span>
      </Button>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, 'PPP (EEEE)', { locale: ja })
            ) : (
              <span>{LABELS.DATE_SELECTOR.SELECT_DATE}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={ja}
          />
        </PopoverContent>
      </Popover>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextDay}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">{LABELS.DATE_SELECTOR.NEXT_DAY}</span>
      </Button>
    </div>
  );
}