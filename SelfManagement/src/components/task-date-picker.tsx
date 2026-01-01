'use client';

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { updateTaskDates } from "@/actions/task-dates"

export function TaskDatePicker({
    taskId,
    startAt,
    endAt
}: {
    taskId: string,
    startAt: Date | null,
    endAt: Date | null
}) {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: startAt || undefined,
        to: endAt || undefined,
    })

    // Auto-save on change
    const handleSelect = async (range: DateRange | undefined) => {
        setDate(range);
        if (range?.from) {
            // If only 'from' is selected, wait for 'to'?? 
            // Actually usually we want to save immediately but range picker behaves slightly differently.
            // Let's save both start/end even if one is undefined for now, or wait for close.
            // For UX, let's just save when Popover closes? Or on specific select.
            // Simplest: Save immediately on valid selection.

            await updateTaskDates(taskId, range.from, range.to || range.from); // Default end to start if single day
        } else {
            await updateTaskDates(taskId, null, null);
        }
    };

    return (
        <div className={cn("grid gap-2")}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"ghost"}
                        size="sm"
                        className={cn(
                            "w-fit justify-start text-left font-normal h-6 px-2 text-xs",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd")} - {format(date.to, "LLL dd")}
                                </>
                            ) : (
                                format(date.from, "LLL dd")
                            )
                        ) : (
                            <span>Pick date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={handleSelect}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
