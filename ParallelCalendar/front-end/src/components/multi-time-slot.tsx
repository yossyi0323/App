"use client";

import { DateTimeInput } from "@/components/date-time-imput";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "./ui/textarea";

export function MultiTimeSlot() {
  return (
    <Card className="mx-auto w-fit">
      <CardHeader>
        <CardTitle>Edit</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <FieldLabel htmlFor="plan-time-slot">Plan</FieldLabel>
          <FieldGroup>
            <Field className="mx-auto">
              <FieldLabel htmlFor="date-required">Start</FieldLabel>
              <DateTimeInput defaultValue={new Date("2025-06-01T10:30:00")} />
            </Field>
            <FieldLabel htmlFor="date-required">End</FieldLabel>
            <DateTimeInput defaultValue={new Date("2025-06-01T10:30:00")} />
          </FieldGroup>
          <FieldLabel htmlFor="do-time-slot">Do</FieldLabel>
          <FieldGroup>
            <FieldLabel htmlFor="time-from">Start</FieldLabel>
            <DateTimeInput defaultValue={new Date("2025-06-01T10:30:00")} />
            <FieldLabel htmlFor="time-to">End</FieldLabel>
            <DateTimeInput defaultValue={new Date("2025-06-01T10:30:00")} />
          </FieldGroup>
        </FieldGroup>
      </CardContent>
      <CardFooter className="bg-card border-t">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <Textarea />
          </Field>
        </FieldGroup>
      </CardFooter>
    </Card>
  );
}
