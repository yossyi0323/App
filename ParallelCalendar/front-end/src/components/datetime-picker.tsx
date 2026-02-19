"use client";

import { Calendar } from "@/components/ui/calendar";

export function DateTimePicker() {
  return (
    <Calendar
      mode="single"
      captionLayout="dropdown"
      className="rounded-lg border"
    />
  );
}
