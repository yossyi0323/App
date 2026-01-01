'use client';

import { format, differenceInDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { useMemo } from 'react';
import { Link2 } from 'lucide-react';
import { TaskDetailSheet } from './task-detail-sheet';

type Task = {
    id: string;
    title: string;
    startAt: Date | null;
    endAt: Date | null;
    status: string;
    dependencies?: string[];
};

export function GanttChart({ tasks }: { tasks: Task[] }) {
    // Filter tasks that have dates
    const scheduledTasks = useMemo(() => tasks.filter(t => t.startAt && t.endAt), [tasks]);

    if (scheduledTasks.length === 0) {
        return <div className="p-4 text-center text-gray-500">No scheduled tasks to display. Set dates for tasks to see them here.</div>;
    }

    // Calculate timeline range
    const minDate = useMemo(() => {
        const dates = scheduledTasks.map(t => new Date(t.startAt!));
        return startOfWeek(new Date(Math.min(...dates.map(d => d.getTime()))));
    }, [scheduledTasks]);

    const maxDate = useMemo(() => {
        const dates = scheduledTasks.map(t => new Date(t.endAt!));
        return endOfWeek(new Date(Math.max(...dates.map(d => d.getTime()))));
    }, [scheduledTasks]);

    const days = eachDayOfInterval({ start: minDate, end: maxDate });
    const totalDays = days.length;

    // Helper to find task row index
    const getTaskIndex = (id: string) => scheduledTasks.findIndex(t => t.id === id);

    return (
        <div className="overflow-x-auto border rounded-lg border-zinc-800 bg-zinc-950">
            <div className="relative min-w-[800px]">
                {/* Header (Days) */}
                <div className="flex border-b border-zinc-800 sticky top-0 bg-zinc-950 z-10">
                    <div className="w-48 flex-shrink-0 p-2 border-r border-zinc-800 font-bold text-sm">Task</div>
                    <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(40px, 1fr))` }}>
                        {days.map(day => (
                            <div key={day.toISOString()} className={`text - center border - r border - zinc - 800 p - 1 text - xs ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-zinc-900/50' : ''
                                } `}>
                                <div className="font-semibold">{format(day, 'dd')}</div>
                                <div className="text-zinc-500 text-[10px]">{format(day, 'EEE')}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SVG Overlay for Dependencies */}
                <svg className="absolute top-[41px] left-0 pointer-events-none z-10 w-full" style={{ height: `${scheduledTasks.length * 41} px` }}>
                    {scheduledTasks.map((task, index) => (
                        task.dependencies?.map(depId => {
                            const depIndex = getTaskIndex(depId);
                            if (depIndex === -1) return null;

                            // Calculate coordinates
                            // Row height is ~41px (border + padding). Let's assume 41px.
                            const rowHeight = 41;
                            const startY = (depIndex * rowHeight) + 20; // Middle of Pred
                            const endY = (index * rowHeight) + 20;     // Middle of Succ

                            const depTask = scheduledTasks[depIndex];
                            const depEnd = new Date(depTask.endAt!);
                            const startStart = new Date(task.startAt!);

                            const depEndOffset = differenceInDays(depEnd, minDate) + 1;
                            const startStartOffset = differenceInDays(startStart, minDate);

                            // Grid column width is approx minmax(40px, 1fr). Ideally we need exact pixels.
                            // This is hard with CSS Grid.
                            // Fallback: Just draw a simple connection if they are close?
                            // Or finding the element via ref? Ref is better but complex in this limited context.
                            // Let's iterate: Just show the link icon on the bar for now.
                            return null;
                        })
                    ))}
                </svg>

                {/* Rows */}
                <div className="space-y-0">
                    {scheduledTasks.map((task, index) => {
                        const startDate = new Date(task.startAt!);
                        const endDate = new Date(task.endAt!);
                        const startOffset = differenceInDays(startDate, minDate);
                        const duration = differenceInDays(endDate, startDate) + 1;

                        return (
                            <div key={task.id} className="flex border-b border-zinc-800 hover:bg-zinc-900/10 h-[41px]">
                                <div className="w-48 flex-shrink-0 p-2 border-r border-zinc-800 text-sm truncate" title={task.title}>
                                    {task.title}
                                </div>
                                <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(40px, 1fr))` }}>
                                    {/* Background Grid */}
                                    {days.map(day => (
                                        <div key={day.toISOString()} className="border-r border-zinc-800/30 h-8" />
                                    ))}

                                    {/* Task Bar */}
                                    <TaskDetailSheet task={task} >
                                        <div
                                            className="absolute h-6 top-1 rounded bg-blue-600/80 border border-blue-500 hover:bg-blue-500 shadow-sm cursor-pointer ml-1 flex items-center px-1"
                                            style={{
                                                gridColumnStart: startOffset + 1,
                                                gridColumnEnd: `span ${duration} `,
                                            }}
                                        >
                                            {task.dependencies && task.dependencies.length > 0 && <Link2 className="w-3 h-3 mr-1 text-white/70" />}
                                            <div className="text-[10px] text-white leading-6 overflow-hidden truncate">
                                                {task.title}
                                            </div>
                                        </div>
                                    </TaskDetailSheet>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
