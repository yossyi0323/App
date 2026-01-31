import { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, Views, type CalendarProps } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import type { DomainEvent, CalendarViewModel } from '../../types';
import { Adapter } from '../../utils/adapter';
import { SidePanel } from '../SidePanel/SidePanel';
import { ResourceHeader } from './ResourceHeader';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar as any) as any;

const initialEvents: DomainEvent[] = [
    { id: 1, title: 'Morning Routine', start: new Date(2026, 0, 19, 7, 0), end: new Date(2026, 0, 19, 9, 0), realDate: new Date(2026, 0, 19), type: 'do', description: '# Routine\n- Coffee\n- News' },
    { id: 2, title: 'Prototyping', start: new Date(2026, 0, 19, 8, 0), end: new Date(2026, 0, 19, 11, 0), realDate: new Date(2026, 0, 19), type: 'plan' },
];
interface MultiVerticalCalendarProps<TEvent extends object, TResource extends object> {
    startDate: Date;
    daysCount: number;
    CalendarResources: TResource[];
    getResourceId: (resource: TResource) => string;
    getResourceTitle: (resource: TResource) => string;
    calendarProps: Omit<CalendarProps<TEvent, TResource>, 'resources' | 'date'>;
}

export const MultiVerticalCalendar = <TEvent extends object, TResource extends object>({ startDate, daysCount, CalendarResources, getResourceId, getResourceTitle, calendarProps }: MultiVerticalCalendarProps<TEvent, TResource>) => {
    const [events, setEvents] = useState<DomainEvent[]>(initialEvents);
    const [startDate, setStartDate] = useState(() => startDate); // 1/19 Mon

    // Side Panel State
    const [selectedEvent, setSelectedEvent] = useState<DomainEvent | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const days = useMemo(() => Array.from({ length: daysCount }, (_, i) => moment(startDate).add(i, 'days').toDate()), [startDate]);
    const resources =
        useMemo(() => {
            const res: any[] = [];
            days.forEach(day => {
                CalendarResources.forEach(resource => {
                    res.push({
                        id: Adapter.toResourceId(day, getResourceId(resource)), title: getResourceTitle(resource), date: day
                    });
                });
                res.push({ id: Adapter.toResourceId(day, 'plan'), title: 'PLAN', date: day });
                res.push({ id: Adapter.toResourceId(day, 'do'), title: 'DO', date: day });
            });
            return res;
        }, [days]);

    const viewModels = useMemo(() => events.map(ev => Adapter.toViewModel(
        ev,
        startDate,
        () => ev.start,
        () => ev.end,
        () => ev.realDate,
        () => ev.type
    )), [events, startDate]);

    const handleNavigate = useCallback((newDate: Date) => setStartDate(newDate), []);

    // Update Event
    const updateEvent = (updated: DomainEvent) => {
        setEvents(prev => prev.map(ev => ev.id === updated.id ? updated : ev));
        setIsPanelOpen(false);
    };
    // Delete Event
    const deleteEvent = (id: number) => {
        setEvents(prev => prev.filter(ev => ev.id !== id));
        setIsPanelOpen(false);
    };
    // Create Event via Selection
    const handleSelectSlot = useCallback((slotInfo: any) => {
        // slotInfo.resourceId から 日付とTypeを特定
        if (!slotInfo.resourceId) return;
        const { date, type } = Adapter.parseResourceId(slotInfo.resourceId);

        // 時間は slotInfo.start / end (ただし日付はbaseDateになっているので、時刻だけ抽出してrealDateに結合)
        const newStart = new Date(date);
        newStart.setHours(slotInfo.start.getHours(), slotInfo.start.getMinutes());

        const newEnd = new Date(date);
        newEnd.setHours(slotInfo.end.getHours(), slotInfo.end.getMinutes());

        const newEvent: DomainEvent = {
            id: Math.random(),
            title: '(New Event)',
            start: newStart,
            end: newEnd,
            realDate: date,
            type: type,
            description: ''
        };

        setEvents(prev => [...prev, newEvent]);
        // 作成直後に編集パネルを開く
        setSelectedEvent(newEvent);
        setIsPanelOpen(true);
    }, []);

    // Open Panel on Click
    const handleSelectEvent = useCallback((event: CalendarViewModel) => {
        // ViewModelからDomainEventを探す
        const domainEvent = events.find(e => e.id === event.id);
        if (domainEvent) {
            setSelectedEvent(domainEvent);
            setIsPanelOpen(true);
        }
    }, [events]);

    const handleEventChange = useCallback((event: DomainEvent, newStart: Date, newEnd: Date, newResourceId?: string) => {
        let newDate = event.realDate;
        let newType = event.type;
        if (newResourceId) {
            const parsed = Adapter.parseResourceId(newResourceId);
            newDate = parsed.date;
            if (event.type !== parsed.type) {
                newType = event.type; // Snap back type
            } else {
                newType = parsed.type;
            }
        }
        const updatedStart = new Date(newDate);
        updatedStart.setHours(newStart.getHours(), newStart.getMinutes());
        const updatedEnd = new Date(newDate);
        updatedEnd.setHours(newEnd.getHours(), newEnd.getMinutes());
        setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, start: updatedStart, end: updatedEnd, realDate: newDate, type: newType } : ev));
    }, []);

    const onEventDrop = useCallback((args: any) => handleEventChange(args.event, args.start, args.end, args.resourceId), [handleEventChange]);
    const onEventResize = useCallback((args: any) => handleEventChange(args.event, args.start, args.end), [handleEventChange]);

    return (
        <div style={{ height: '95vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <DnDCalendar
                localizer={localizer}
                events={viewModels}
                date={startDate}
                onNavigate={handleNavigate}
                defaultView={Views.DAY}
                views={[Views.DAY]}
                toolbar={true}
                resources={resources}
                resourceIdAccessor="id"
                resourceTitleAccessor="title"
                selectable // Enable slot selection
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                components={{
                    resourceHeader: ResourceHeader,
                    toolbar: (props: any) => (
                        <div className="rbc-toolbar" style={{ padding: '10px 20px', borderBottom: '1px solid var(--border-color)', marginBottom: 0 }}>
                            <span className="rbc-btn-group">
                                <button type="button" onClick={() => props.onNavigate('PREV')}>&lt;</button>
                                <button type="button" onClick={() => props.onNavigate('TODAY')}>今日</button>
                                <button type="button" onClick={() => props.onNavigate('NEXT')}>&gt;</button>
                            </span>
                            <span className="rbc-toolbar-label" style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.2rem', marginLeft: '16px' }}>
                                {moment(startDate).format('YYYY年 M月 D日')} 〜 {moment(startDate).add(6, 'days').format('M月 D日')}
                            </span>
                        </div>
                    )
                }}
                onEventDrop={onEventDrop}
                onEventResize={onEventResize}
                resizable
                min={new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 6, 0)}
                max={new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 23, 59)}
                step={30}
                timeslots={2}
                eventPropGetter={(event: DomainEvent) => ({
                    style: {
                        backgroundColor: event.type === 'plan' ? 'var(--plan-bg)' : 'var(--do-bg)',
                        color: event.type === 'plan' ? 'var(--plan-text)' : 'var(--do-text)',
                        border: `1px solid ${event.type === 'plan' ? 'var(--plan-border)' : 'var(--do-border)'}`,
                        borderLeftWidth: '4px'
                    }
                })}
            />

            {/* Side Panel Overlay */}
            <SidePanel
                event={selectedEvent}
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
                onSave={updateEvent}
                onDelete={deleteEvent}
            />
        </div>
    );
};
