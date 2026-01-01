"use client"

import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, differenceInMinutes, startOfDay } from 'date-fns';
import { getTimeBlocks } from '@/actions/schedule';

type TimeBlock = {
    id: string;
    startAt: Date;
    endAt: Date;
    type: 'plan' | 'actual';
    title?: string;
    task?: { title: string };
};

export function VerticalScheduler() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [blocks, setBlocks] = useState<TimeBlock[]>([]);
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });

    useEffect(() => {
        const fetchData = async () => {
            const data: any = await getTimeBlocks(startDate, endDate);
            setBlocks(data);
        };
        fetchData();
    }, [startDate]);

    const days = eachDayOfInterval({
        start: startDate,
        end: addDays(startDate, 6)
    });

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const HOUR_HEIGHT = 80; // px (h-20)

    const renderBlocksForDay = (day: Date) => {
        const dayBlocks = blocks.filter(b => isSameDay(new Date(b.startAt), day));

        return dayBlocks.map(block => {
            const start = new Date(block.startAt);
            const end = new Date(block.endAt);
            const startMinutes = differenceInMinutes(start, startOfDay(start));
            const durationMinutes = differenceInMinutes(end, start);

            const top = (startMinutes / 60) * HOUR_HEIGHT;
            const height = (durationMinutes / 60) * HOUR_HEIGHT;

            const isPlan = block.type === 'plan';
            const left = isPlan ? '2%' : '52%';
            const width = '46%';
            const color = isPlan ? 'bg-blue-600/80 border-blue-500' : 'bg-emerald-600/80 border-emerald-500';

            return (
                <div
                    key={block.id}
                    className={`absolute rounded border text-[10px] p-1 overflow-hidden leading-tight text-white hover:brightness-110 cursor-pointer z-10 ${color}`}
                    style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left,
                        width
                    }}
                    title={`${block.task?.title || 'No Task'} (${format(start, 'HH:mm')} - ${format(end, 'HH:mm')})`}
                >
                    <div className="font-bold border-b border-white/20 mb-0.5 pb-0.5">{format(start, 'HH:mm')} - {format(end, 'HH:mm')}</div>
                    <div className="font-semibold truncate">{block.task?.title || '(No Task)'}</div>
                    {block.type === 'actual' && <div className="text-[9px] text-white/70 italic text-right px-1">Actual</div>}
                </div>
            );
        });
    }

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-zinc-300 overflow-hidden">
            {/* Header */}
            <div className="flex border-b border-zinc-800 shrink-0">
                <div className="w-16 border-r border-zinc-800 p-2 bg-zinc-950"></div>
                {days.map(day => (
                    <div key={day.toISOString()} className={`flex-1 text-center p-2 border-r border-zinc-800 ${isSameDay(day, new Date()) ? 'bg-zinc-900 text-white' : ''}`}>
                        <div className="text-sm font-medium">{format(day, 'EEE')}</div>
                        <div className="text-xl font-bold">{format(day, 'd')}</div>
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                <div className="flex relative min-h-[1920px]"> {/* 24 * 80 = 1920px */}
                    {/* Time Column */}
                    <div className="w-16 flex-shrink-0 border-r border-zinc-800 bg-zinc-950/50">
                        {hours.map(hour => (
                            <div key={hour} className="h-20 border-b border-zinc-800 text-xs text-zinc-500 text-right p-1 pr-2 relative box-border">
                                <span className="-top-2 absolute right-2">{hour}:00</span>
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    {days.map(day => (
                        <div key={day.toISOString()} className="flex-1 border-r border-zinc-800 relative">
                            {/* Grid Lines */}
                            {hours.map(hour => (
                                <div key={hour} className="h-20 border-b border-zinc-800 hover:bg-zinc-900/10 box-border"></div>
                            ))}

                            {/* Blocks */}
                            {renderBlocksForDay(day)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
