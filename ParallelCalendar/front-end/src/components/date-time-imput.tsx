"use client";

import { Calendar } from "@/components/ui/calendar";
import { Field } from "@/components/ui/field";
import { InputGroup } from "@/components/ui/input-group";
import { InputGroupInput } from "@/components/ui/input-group";
import { InputGroupAddon } from "@/components/ui/input-group";
import { InputGroupButton } from "@/components/ui/input-group";
import { Popover } from "@/components/ui/popover";
import { PopoverTrigger } from "@/components/ui/popover";
import { PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Clock2Icon } from "lucide-react";
import React from "react";

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

export function DateTimeInput({ defaultValue }: { defaultValue: Date }) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(defaultValue);
  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [value, setValue] = React.useState(formatDate(date));
  return (
    <div className="flex flex-row gap-2">
      <Field className="mx-auto">
        <InputGroup>
          <InputGroupInput
            id="date-required"
            value={value}
            placeholder="June 01, 2025"
            onChange={(e) => {
              const date = new Date(e.target.value);
              setValue(e.target.value);
              if (isValidDate(date)) {
                setDate(date);
                setMonth(date);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
              }
            }}
          />
          <InputGroupAddon align="inline-end">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <InputGroupButton
                  id="date-picker"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Select date"
                >
                  <CalendarIcon />
                  <span className="sr-only">Select date</span>
                </InputGroupButton>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="end"
                alignOffset={-8}
                sideOffset={10}
              >
                <Calendar
                  mode="single"
                  selected={date}
                  month={month}
                  onMonthChange={setMonth}
                  onSelect={(date) => {
                    setDate(date);
                    setValue(formatDate(date));
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <Field>
        <InputGroup>
          <InputGroupInput
            id="time-to"
            type="datetime"
            step="1"
            defaultValue="12:30:00"
            className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
          <InputGroupAddon>
            <Clock2Icon className="text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </div>
  );
}
