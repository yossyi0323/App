import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import moment from "moment";
import type { Event } from "react-big-calendar";

import type { withDragAndDropProps } from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "../react-big-calendar-overrides.css";
import { useState } from "react";

import { useGetTasks, useGetTimeSlots } from "../lib/api/generated";

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop<CalendarEvent, Resource>(Calendar);

type CalendarEvent = Event & {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resourceId: number | number[];
  allDay?: boolean;
};

type Resource = {
  id: number;
  title: string;
};

export default function ParallelCalendar() {
  const { data: tasks } = useGetTasks({
    userId: "0194e4fb-4b5a-73d9-a864-21975e526c8f",
  });
  console.log("--tasks--");
  console.log(tasks);
  console.log("---");
  const { data: timeSlots } = useGetTimeSlots({
    userId: "0194e4fb-4b5a-73d9-a864-21975e526c8f",
    startAt: "2026-02-19T18:00:00.000Z",
    endAt: "2026-02-19T20:00:00.000Z",
  });
  console.log("--timeSlots--");
  console.log(timeSlots);
  console.log("---");

  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 1,
      title: "Event 1",
      start: new Date("2026-02-19T18:00:00"),
      end: new Date("2026-02-19T20:00:00"),
      resourceId: 1,
    },
  ]);
  // const events = timeSlots?.map((timeSlot) => {
  //   const task = tasks?.find((task) => task.taskId === timeSlot.taskId);
  //   const event = {
  //     id: timeSlot.timeSlotId,
  //     title: task?.title ?? "",
  //     start: timeSlot.startAt,
  //     end: timeSlot.endAt,
  //     resourceId: timeSlot.allocation,
  //   };
  //   return event;
  // });
  // TODO 後で消す
  const resourceMap: Resource[] = [
    {
      id: 1,
      title: "Plan",
    },
    {
      id: 2,
      title: "Do",
    },
  ];

  // function onEventDrop(args: EventInteractionArgs<CalendarEvent>) {
  //   console.log(args);
  // }
  // function onEventResize(args: EventInteractionArgs<CalendarEvent>) {
  //   console.log(args);
  // }

  const onEventResize: withDragAndDropProps["onEventResize"] = (data) => {
    setEvents((currentEvents) => {
      const { event, start, end } = data;
      const existing = currentEvents.find(
        (e) => e.id === (event as CalendarEvent).id,
      );
      if (!existing) return currentEvents;
      return currentEvents.map((e) =>
        e.id === (event as CalendarEvent).id
          ? { ...e, start: new Date(start), end: new Date(end) }
          : e,
      );
    });
  };

  const onEventDrop: withDragAndDropProps["onEventDrop"] = (data) => {
    console.log(data);
  };

  return (
    <div className="rbc-wrapper">
      <DragAndDropCalendar
        defaultView="day"
        events={events}
        localizer={localizer}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        resizable
        style={{ height: "100vh" }}
        resources={resourceMap}
        views={["day"]}
        //   children?: React.ReactNode;
        //   localizer: DateLocalizer;

        //   date?: stringOrDate | undefined;
        //   getNow?: () => stringOrDate | undefined;
        //   view?: View | undefined;
        //   events?: TEvent[] | undefined;
        //   backgroundEvents?: TEvent[] | undefined;
        //   handleDragStart?: ((event: TEvent) => void) | undefined;
        //   onNavigate?: ((newDate: Date, view: View, action: NavigateAction) => void) | undefined;
        //   onView?: ((view: View) => void) | undefined;
        //   onDrillDown?: ((date: Date, view: View) => void) | undefined;
        //   onSelectSlot?: ((slotInfo: SlotInfo) => void) | undefined;
        //   onDoubleClickEvent?: ((event: TEvent, e: React.SyntheticEvent<HTMLElement>) => void) | undefined;
        //   onSelectEvent?: ((event: TEvent, e: React.SyntheticEvent<HTMLElement>) => void) | undefined;
        //   onKeyPressEvent?: ((event: TEvent, e: React.SyntheticEvent<HTMLElement>) => void) | undefined;
        //   onSelecting?: (range: { start: Date; end: Date }) => boolean | undefined;
        //   // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
        //   onRangeChange?: (range: Date[] | { start: Date; end: Date }, view?: View) => void | undefined;
        //   showAllEvents?: boolean | undefined;
        //   selected?: any;
        //   views?: ViewsProps<TEvent, TResource> | undefined;
        //   doShowMoreDrillDown?: boolean | undefined;
        //   drilldownView?: View | null | undefined;
        //   getDrilldownView?:
        //       | ((targetDate: Date, currentViewName: View, configuredViewNames: View[]) => void)
        //       | null
        //       | undefined;
        //   length?: number | undefined;
        //   toolbar?: boolean | undefined;
        //   popup?: boolean | undefined;
        //   popupOffset?: number | { x: number; y: number } | undefined;
        //   selectable?: boolean | "ignoreEvents" | undefined;
        //   longPressThreshold?: number | undefined;
        //   step?: number | undefined;
        //   timeslots?: number | undefined;
        //   rtl?: boolean | undefined;
        //   eventPropGetter?: EventPropGetter<TEvent> | undefined;
        //   slotPropGetter?: SlotPropGetter | undefined;
        //   slotGroupPropGetter?: SlotGroupPropGetter | undefined;
        //   dayPropGetter?: DayPropGetter | undefined;
        //   showMultiDayTimes?: boolean | undefined;
        //   allDayMaxRows?: number | undefined;
        //   min?: Date | undefined;
        //   max?: Date | undefined;
        //   scrollToTime?: Date | undefined;
        //   enableAutoScroll?: boolean | undefined;
        //   culture?: Culture | undefined;
        //   formats?: Formats | undefined;
        //   components?: Components<TEvent, TResource> | undefined;
        //   messages?: Messages<TEvent> | undefined;
        //   dayLayoutAlgorithm?: DayLayoutAlgorithm | DayLayoutFunction<TEvent> | undefined;
        //   titleAccessor?: keyof TEvent | ((event: TEvent) => string) | undefined;
        //   tooltipAccessor?: keyof TEvent | ((event: TEvent) => string) | null | undefined;
        //   allDayAccessor?: keyof TEvent | ((event: TEvent) => boolean) | undefined;
        //   startAccessor?: keyof TEvent | ((event: TEvent) => Date) | undefined;
        //   endAccessor?: keyof TEvent | ((event: TEvent) => Date) | undefined;
        //   resourceAccessor?: keyof TEvent | ((event: TEvent) => any) | undefined;
        //   resources?: TResource[] | undefined;
        //   resourceIdAccessor?: keyof TResource | ((resource: TResource) => any) | undefined;
        //   resourceTitleAccessor?: keyof TResource | ((resource: TResource) => any) | undefined;
        //   resourceGroupingLayout?: boolean | undefined;
        //   defaultView?: View | undefined;
        //   defaultDate?: stringOrDate | undefined;
        //   className?: string | undefined;
        //   elementProps?: React.HTMLAttributes<HTMLElement> | undefined;
        //   style?: React.CSSProperties | undefined;
        //   onShowMore?: ((events: TEvent[], date: Date) => void) | undefined;
        //   onEventDrop?: ((args: EventInteractionArgs<TEvent>) => void) | undefined;
        // onEventResize?: ((args: EventInteractionArgs<TEvent>) => void) | undefined;
        // onDragStart?: ((args: OnDragStartArgs<TEvent>) => void) | undefined;
        // onDragOver?: ((event: React.DragEvent) => void) | undefined;
        // onDropFromOutside?: ((args: DragFromOutsideItemArgs) => void) | undefined;
        // dragFromOutsideItem?: (() => TEvent) | undefined;
        // draggableAccessor?: keyof TEvent | ((event: TEvent) => boolean) | undefined;
        // resizableAccessor?: keyof TEvent | ((event: TEvent) => boolean) | undefined;
        // selectable?: true | false | "ignoreEvents" | undefined;
        // resizable?: boolean | undefined;
        // components?: Components<TEvent, TResource> | undefined;
        // elementProps?: React.HTMLAttributes<HTMLElement> | undefined;
        // step?: number | undefined;
      />
    </div>
  );
}
