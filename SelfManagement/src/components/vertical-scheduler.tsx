"use client";

import { useState, useEffect, useMemo } from 'react';
import { format, addDays, subDays, addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, differenceInMinutes, startOfDay, addMinutes } from 'date-fns';
import { getTimeBlocks, updateTimeBlock } from '@/actions/schedule';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Settings2, MessageSquare } from 'lucide-react';
import { ChatSection } from './chat-section';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { TimeBlockDetailSheet } from './time-block-detail-sheet';
import { cn } from '@/lib/utils';
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
    useDraggable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

type TimeBlock = {
    id: string;
    startAt: Date;
    endAt: Date;
    type: 'plan' | 'actual';
    title?: string;
    taskToTimeBlocks: {
        task: { title: string }
    }[];
};

const HOUR_HEIGHT = 80;

function DraggableBlock({ block, day, onResizeStart }: { block: TimeBlock, day: Date, onResizeStart: (e: React.MouseEvent, block: TimeBlock, type: 'start' | 'end') => void }) {
    const start = new Date(block.startAt);
    const end = new Date(block.endAt);
    const startMinutes = differenceInMinutes(start, startOfDay(start));
    const durationMinutes = differenceInMinutes(end, start);

    const top = (startMinutes / 60) * HOUR_HEIGHT;
    const height = (durationMinutes / 60) * HOUR_HEIGHT;

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: block.id,
        data: { block, day }
    });

    const isPlan = block.type === 'plan';
    const left = isPlan ? '2%' : '52%';
    const width = '46%';
    const color = isPlan ? 'bg-blue-600/80 border-blue-500 shadow-blue-500/20' : 'bg-emerald-600/80 border-emerald-500 shadow-emerald-500/20';

    const taskTitles = block.taskToTimeBlocks.map(t => t.task.title).join(', ');
    const displayTitle = block.title || taskTitles || '(No Task)';

    const style = {
        top: `${top}px`,
        height: `${height}px`,
        left,
        width,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : 10,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <TimeBlockDetailSheet block={block as any}>
            <div
                ref={setNodeRef}
                style={style}
                {...listeners}
                {...attributes}
                className={cn(
                    "absolute rounded-lg border text-[10px] p-2 overflow-hidden leading-tight text-white hover:brightness-110 cursor-grab active:cursor-grabbing shadow-lg transition-all duration-200 group/block",
                    color
                )}
                title={`${displayTitle} (${format(start, 'HH:mm')} - ${format(end, 'HH:mm')})`}
            >
                {/* Resize Handle Top */}
                <div
                    className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-50 opacity-0 group-hover/block:opacity-100 bg-white/10 hover:bg-white/30 transition-opacity"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        onResizeStart(e, block, 'start');
                    }}
                />

                <div className="font-bold border-b border-white/20 mb-1 pb-1 flex justify-between items-center group/title">
                    <span>{format(start, 'HH:mm')} - {format(end, 'HH:mm')}</span>
                </div>
                {block.title && <div className="font-bold text-[11px] mb-0.5 truncate uppercase tracking-tighter text-blue-100">{block.title}</div>}
                <div className="font-semibold text-[10.5px] line-clamp-3 opacity-90">{taskTitles || '(No Task)'}</div>

                {/* Resize Handle Bottom */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-50 opacity-0 group-hover/block:opacity-100 bg-white/10 hover:bg-white/30 transition-opacity"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        onResizeStart(e, block, 'end');
                    }}
                />
            </div>
        </TimeBlockDetailSheet>
    );
}

export function VerticalScheduler() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(1); // 0: Sunday, 1: Monday
    const [blocks, setBlocks] = useState<TimeBlock[]>([]);

    const startDate = startOfWeek(currentDate, { weekStartsOn });
    const endDate = endOfWeek(currentDate, { weekStartsOn });

    const sensors = useSensors(useSensor(PointerSensor));

    const fetchData = async () => {
        const data: any = await getTimeBlocks(startDate, endDate);
        setBlocks(data);
    };

    useEffect(() => {
        fetchData();
    }, [startDate]);

    const days = eachDayOfInterval({
        start: startDate,
        end: addDays(startDate, 6)
    });

    const hours = Array.from({ length: 24 }, (_, i) => i);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, delta } = event;
        if (!active) return;

        const block = active.data.current?.block as TimeBlock;
        if (!block) return;

        // Calculate time change: 1px = 60/80 minutes = 0.75 min
        const deltaMinutes = Math.round((delta.y / HOUR_HEIGHT) * 60);
        // Snap to 5 minutes
        const snappedDelta = Math.round(deltaMinutes / 5) * 5;

        if (snappedDelta === 0) return;

        const newStart = addMinutes(new Date(block.startAt), snappedDelta);
        const newEnd = addMinutes(new Date(block.endAt), snappedDelta);

        // Optimistic update
        setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, startAt: newStart, endAt: newEnd } : b));

        try {
            await updateTimeBlock(block.id, newStart, newEnd);
        } catch (error) {
            console.error("Failed to update time block:", error);
            fetchData(); // Rollback
        }
    };

    const [resizing, setResizing] = useState<{ block: TimeBlock, type: 'start' | 'end', initialY: number } | null>(null);

    const handleResizeStart = (e: React.MouseEvent, block: TimeBlock, type: 'start' | 'end') => {
        setResizing({ block, type, initialY: e.clientY });
        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaY = moveEvent.clientY - e.clientY;
            const deltaMinutes = Math.round((deltaY / HOUR_HEIGHT) * 60);
            const snappedDelta = Math.round(deltaMinutes / 5) * 5;

            setBlocks(prev => prev.map(b => {
                if (b.id !== block.id) return b;
                const newStart = type === 'start' ? addMinutes(new Date(block.startAt), snappedDelta) : b.startAt;
                const newEnd = type === 'end' ? addMinutes(new Date(block.endAt), snappedDelta) : b.endAt;
                return { ...b, startAt: newStart, endAt: newEnd };
            }));
        };

        const onMouseUp = async (upEvent: MouseEvent) => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            const finalDeltaY = upEvent.clientY - e.clientY;
            const deltaMinutes = Math.round((finalDeltaY / HOUR_HEIGHT) * 60);
            const snappedDelta = Math.round(deltaMinutes / 5) * 5;

            const finalStart = type === 'start' ? addMinutes(new Date(block.startAt), snappedDelta) : block.startAt;
            const finalEnd = type === 'end' ? addMinutes(new Date(block.endAt), snappedDelta) : block.endAt;

            try {
                await updateTimeBlock(block.id, finalStart, finalEnd);
            } catch (err) {
                console.error("Resize update failed", err);
                fetchData();
            }
            setResizing(null);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const renderBlocksForDay = (day: Date) => {
        const dayBlocks = blocks.filter(b => isSameDay(new Date(b.startAt), day));
        return dayBlocks.map(block => (
            <DraggableBlock key={block.id} block={block} day={day} onResizeStart={handleResizeStart} />
        ));
    }

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="flex flex-col h-full bg-zinc-950 text-zinc-300 overflow-hidden select-none">
                {/* Navigation Toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-950 shrink-0">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="h-8 border-zinc-800 hover:bg-zinc-900 text-xs font-bold">TODAY</Button>
                        <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subDays(currentDate, 1))} className="h-7 w-7 text-zinc-500 hover:text-white"><ChevronLeft className="w-4 h-4" /></Button>
                            <div className="px-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">Day</div>
                            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))} className="h-7 w-7 text-zinc-500 hover:text-white"><ChevronRight className="w-4 h-4" /></Button>
                        </div>
                        <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="h-7 w-7 text-zinc-500 hover:text-white"><ChevronLeft className="w-4 h-4" /></Button>
                            <div className="px-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">Week</div>
                            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="h-7 w-7 text-zinc-500 hover:text-white"><ChevronRight className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="h-8 border-zinc-800 bg-zinc-900/50 px-3 flex items-center gap-2 hover:bg-zinc-900 transition-colors">
                                    <CalendarIcon className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm font-bold tracking-tight">{format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800 shadow-2xl" align="end">
                                <Calendar
                                    mode="single"
                                    selected={currentDate}
                                    onSelect={(date) => date && setCurrentDate(date)}
                                    initialFocus
                                    className="bg-zinc-950"
                                />
                            </PopoverContent>
                        </Popover>

                        <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
                            <button
                                onClick={() => setWeekStartsOn(0)}
                                className={`px-2 py-1 text-[9px] font-black uppercase tracking-tighter rounded-md transition-all ${weekStartsOn === 0 ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-600 hover:text-zinc-400'}`}
                            >
                                SUN
                            </button>
                            <button
                                onClick={() => setWeekStartsOn(1)}
                                className={`px-2 py-1 text-[9px] font-black uppercase tracking-tighter rounded-md transition-all ${weekStartsOn === 1 ? 'bg-zinc-800 text-white shadow-inner' : 'text-zinc-600 hover:text-zinc-400'}`}
                            >
                                MON
                            </button>
                        </div>
                    </div>
                </div>

                {/* Day Header */}
                <div className="flex border-b border-zinc-800 shrink-0 shadow-xl z-20 bg-zinc-950">
                    <div className="w-16 border-r border-zinc-800 p-2"></div>
                    {days.map(day => {
                        const isToday = isSameDay(day, new Date());
                        const isSelected = isSameDay(day, currentDate);
                        return (
                            <div key={day.toISOString()} className={`flex-1 text-center py-3 border-r border-zinc-800 transition-all ${isToday ? 'bg-blue-500/10 text-blue-400' : ''} ${isSelected ? 'ring-inset ring-2 ring-blue-500/20' : ''}`}>
                                <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">{format(day, 'EEE')}</div>
                                <div className={`text-xl font-black ${isToday ? 'text-blue-400' : 'text-zinc-200'} ${isSelected ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`}>{format(day, 'd')}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[radial-gradient(circle_at_50%_50%,_rgba(24,24,27,1)_0%,_rgba(9,9,11,1)_100%)]">
                    <div className="flex relative min-h-[1920px]">
                        {/* Time Column */}
                        <div className="w-16 flex-shrink-0 border-r border-zinc-800 bg-zinc-950/40 backdrop-blur-sm sticky left-0 z-30">
                            {hours.map(hour => (
                                <div key={hour} className="h-20 border-b border-zinc-800 text-[10px] font-bold text-zinc-600 text-right pr-3 relative box-border">
                                    <span className="-top-2 absolute right-3 bg-zinc-950 px-1 rounded">{hour}:00</span>
                                </div>
                            ))}
                        </div>

                        {/* Days Columns */}
                        {days.map(day => (
                            <div key={day.toISOString()} className="flex-1 border-r border-zinc-800/50 relative group/col hover:bg-white/[0.01] transition-colors">
                                {/* Grid Lines */}
                                {hours.map(hour => (
                                    <div key={hour} className="h-20 border-b border-zinc-800/20 box-border"></div>
                                ))}

                                {/* Blocks */}
                                {renderBlocksForDay(day)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DndContext>
    );
}
