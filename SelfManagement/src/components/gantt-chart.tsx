"use client";

import { format, differenceInDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { useMemo, useState, useRef, useEffect } from 'react';
import { Link2, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { TaskDetailSheet } from './task-detail-sheet';
import { updateTaskDates } from '@/actions/tasks';
import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
    useDraggable,
    DragMoveEvent,
    DragStartEvent
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button } from './ui/button';

type Task = {
    id: string;
    title: string;
    startAt: Date | null;
    endAt: Date | null;
    status: string;
    parentId: string | null;
    dependencies?: string[];
};

const DAY_WIDTH = 44;

function DraggableGanttBar({ task, minDate, onTaskClick }: { task: Task, minDate: Date, onTaskClick: (task: Task) => void }) {
    const startDate = new Date(task.startAt!);
    const endDate = new Date(task.endAt!);
    const startOffset = differenceInDays(startDate, minDate);
    const duration = Math.max(1, differenceInDays(endDate, startDate) + 1);
    const [dragStartPos, setDragStartPos] = useState<{ x: number, y: number } | null>(null);

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { type: 'move', task }
    });

    const style = {
        gridColumnStart: startOffset + 1,
        gridColumnEnd: `span ${duration}`,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : 20,
        opacity: isDragging ? 0.6 : 1,
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        setDragStartPos({ x: e.clientX, y: e.clientY });
    };

    const handleClick = (e: React.MouseEvent) => {
        // Only trigger click if we didn't drag
        if (dragStartPos) {
            const dx = Math.abs(e.clientX - dragStartPos.x);
            const dy = Math.abs(e.clientY - dragStartPos.y);
            if (dx < 5 && dy < 5) {
                e.stopPropagation();
                onTaskClick(task);
            }
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onPointerDown={handlePointerDown}
            onClick={handleClick}
            className={`
                group/bar relative h-7 top-1.5 rounded-md shadow-lg border cursor-pointer hover:ring-2 hover:ring-blue-500/30 flex items-center px-2 transition-all duration-200
                ${task.status === 'done' ? 'bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/30' :
                    task.status === 'doing' ? 'bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30' :
                        'bg-zinc-800 border-zinc-700 hover:bg-zinc-700'}
            `}
        >
            <div className="flex items-center w-full overflow-hidden">
                <span className="text-[10px] font-bold text-zinc-100 truncate tracking-tight">{task.title}</span>
            </div>
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white/10 rounded-l-md" />
        </div>
    );
}

export function GanttChart({ tasks }: { tasks: Task[] }) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const sensors = useSensors(useSensor(PointerSensor));

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const sortedTasks = useMemo(() => {
        const buildTree = (parentId: string | null = null, depth = 0): (Task & { depth: number, hasChildren: boolean })[] => {
            const children = tasks.filter(t => t.parentId === parentId);
            let result: (Task & { depth: number, hasChildren: boolean })[] = [];

            children.forEach(child => {
                const subChildren = tasks.filter(t => t.parentId === child.id);
                result.push({ ...child, depth, hasChildren: subChildren.length > 0 });
                if (expandedIds.has(child.id)) {
                    result = result.concat(buildTree(child.id, depth + 1));
                }
            });
            return result;
        };
        return buildTree(null);
    }, [tasks, expandedIds]);

    const scheduledVisibleTasks = useMemo(() => sortedTasks.filter(t => t.startAt && t.endAt), [sortedTasks]);

    const minDate = useMemo(() => {
        const dates = tasks.filter(t => t.startAt).map(t => new Date(t.startAt!));
        if (dates.length === 0) return startOfWeek(new Date(), { weekStartsOn: 1 });
        return startOfWeek(new Date(Math.min(...dates.map(d => d.getTime()))), { weekStartsOn: 1 });
    }, [tasks]);

    const maxDate = useMemo(() => {
        const dates = tasks.filter(t => t.endAt).map(t => new Date(t.endAt!));
        if (dates.length === 0) return addDays(minDate, 14);
        return endOfWeek(new Date(Math.max(...dates.map(d => d.getTime()))), { weekStartsOn: 1 });
    }, [tasks, minDate]);

    const days = eachDayOfInterval({ start: minDate, end: maxDate });
    const totalDays = days.length;

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, delta } = event;
        const task = active.data.current?.task as Task;
        if (!task) return;

        const deltaDays = Math.round(delta.x / DAY_WIDTH);
        if (deltaDays === 0) return;

        const newStart = addDays(new Date(task.startAt!), deltaDays);
        const newEnd = addDays(new Date(task.endAt!), deltaDays);

        await updateTaskDates(task.id, newStart, newEnd);
    };

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div className="border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl flex flex-col h-full rounded-xl">
                <div className="overflow-auto custom-scrollbar flex-1 relative">
                    <div className="relative" style={{ width: `${240 + (totalDays * DAY_WIDTH)}px` }}>
                        {/* Header */}
                        <div className="flex border-b border-zinc-800 sticky top-0 bg-zinc-950 shrink-0 z-30">
                            <div className="w-60 shrink-0 p-4 border-r border-zinc-800 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500 bg-zinc-950">Task Hierarchy</div>
                            <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${totalDays}, ${DAY_WIDTH}px)` }}>
                                {days.map(day => {
                                    const isToday = isSameDay(day, new Date());
                                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                                    return (
                                        <div key={day.toISOString()} className={`flex flex-col items-center justify-center border-r border-zinc-800/40 py-2 ${isWeekend ? 'bg-zinc-900/30' : ''} ${isToday ? 'bg-blue-500/10' : ''}`}>
                                            <span className={`text-[9px] font-bold tracking-tighter uppercase ${isToday ? 'text-blue-400' : 'text-zinc-600'}`}>{format(day, 'EEE')}</span>
                                            <span className={`text-xs font-black ${isToday ? 'text-blue-400' : 'text-zinc-300'}`}>{format(day, 'dd')}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Body */}
                        <div className="relative">
                            {sortedTasks.map((task) => (
                                <div key={task.id} className="flex border-b border-zinc-800/40 hover:bg-white/[0.02] h-10 transition-colors group relative">
                                    <div className="w-60 shrink-0 border-r border-zinc-800 text-[11px] font-medium text-zinc-400 truncate flex items-center px-3 gap-2 bg-zinc-950/50 group-hover:bg-zinc-950 transition-colors z-20">
                                        <div style={{ width: `${task.depth * 16}px` }} className="shrink-0" />

                                        {task.hasChildren ? (
                                            <button
                                                onClick={(e) => toggleExpand(task.id, e)}
                                                className="w-4 h-4 rounded-md hover:bg-white/10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                                            >
                                                <span className="transform transition-transform">{expandedIds.has(task.id) ? '▼' : '▶'}</span>
                                            </button>
                                        ) : (
                                            <div className="w-4 h-4" />
                                        )}

                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.status === 'done' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : task.status === 'doing' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-zinc-700'}`} />
                                        <span className="truncate group-hover:text-zinc-200 transition-colors">{task.title}</span>
                                    </div>

                                    <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${totalDays}, ${DAY_WIDTH}px)` }}>
                                        {/* Background Cells */}
                                        {days.map(day => (
                                            <div key={day.toISOString()} className={`border-r border-zinc-800/20 h-full ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-zinc-900/10' : ''}`} />
                                        ))}

                                        {/* Row Task Bar */}
                                        {task.startAt && task.endAt && (
                                            <DraggableGanttBar task={task} minDate={minDate} onTaskClick={setSelectedTask} />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Detail Sheet */}
            {selectedTask && (
                <TaskDetailSheet task={selectedTask} key={selectedTask.id}>
                    <Button className="hidden" />
                </TaskDetailSheet>
            )}
        </DndContext>
    );
}

