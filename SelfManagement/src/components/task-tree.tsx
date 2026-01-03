"use client";

import { createTask, deleteTask, updateTaskStatus } from '@/actions/tasks';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, User, Calendar as CalendarIcon, MoreHorizontal, Search, SortAsc, SortDesc, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TaskDetailSheet } from './task-detail-sheet';
import { format } from 'date-fns';

type Task = {
    id: string;
    title: string;
    status: 'planned' | 'doing' | 'waiting' | 'reviewing' | 'done';
    parentId: string | null;
    startAt: Date | null;
    endAt: Date | null;
    assignee?: string | null;
    category?: string;
    dependencies?: string[];
    children?: Task[];
};

import { TaskDatePicker } from './task-date-picker';
import { TaskDependencySelector } from './task-dependency-selector';

export function TaskTree({ tasks }: { tasks: Task[] }) {
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<'startAt' | 'title'>('startAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Sorting logic
    const sortedTasks = useMemo(() => {
        return [...tasks].sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'startAt') {
                const dateA = a.startAt ? new Date(a.startAt).getTime() : 0;
                const dateB = b.startAt ? new Date(b.startAt).getTime() : 0;
                comparison = dateA - dateB;
            } else {
                comparison = a.title.localeCompare(b.title);
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [tasks, sortBy, sortOrder]);

    // Search and Flattening logic
    const isSearching = search.length > 0;

    const treeOrFlattened = useMemo(() => {
        if (!isSearching) {
            // Build tree hierarchy
            const taskMap = new Map<string, Task>();
            const roots: Task[] = [];
            sortedTasks.forEach(t => taskMap.set(t.id, { ...t, children: [] }));
            sortedTasks.forEach(t => {
                const task = taskMap.get(t.id)!;
                if (t.parentId && taskMap.has(t.parentId)) {
                    taskMap.get(t.parentId)!.children!.push(task);
                } else {
                    roots.push(task);
                }
            });
            return roots;
        } else {
            // Flattened search results
            return sortedTasks.filter(t =>
                t.title.toLowerCase().includes(search.toLowerCase()) ||
                (t.category && t.category.toLowerCase().includes(search.toLowerCase()))
            );
        }
    }, [sortedTasks, search, isSearching]);

    return (
        <div className="w-full text-sm flex flex-col h-full overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-4 mb-4 pb-2 border-b border-zinc-800/50">
                <div className="relative flex-1 group">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                        placeholder="Filter board..."
                        className="pl-9 h-8 bg-zinc-900/50 border-zinc-800 text-xs focus:ring-1 focus:ring-blue-500/50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-2 text-[10px] font-bold uppercase tracking-tighter ${sortBy === 'startAt' ? 'text-blue-400 bg-blue-500/10' : 'text-zinc-500'}`}
                        onClick={() => {
                            if (sortBy === 'startAt') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            else setSortBy('startAt');
                        }}
                    >
                        Date {sortBy === 'startAt' && (sortOrder === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />)}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 px-2 text-[10px] font-bold uppercase tracking-tighter ${sortBy === 'title' ? 'text-blue-400 bg-blue-500/10' : 'text-zinc-500'}`}
                        onClick={() => {
                            if (sortBy === 'title') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                            else setSortBy('title');
                        }}
                    >
                        Name {sortBy === 'title' && (sortOrder === 'asc' ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />)}
                    </Button>
                </div>
            </div>

            {/* Table Header */}
            <div className="flex items-center px-2 py-2 border-b border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex-1 pl-8">Task Title</div>
                <div className="w-24 text-center">Status</div>
                <div className="w-32">timeline</div>
                <div className="w-16 text-center">Owner</div>
            </div>

            {/* Rows */}
            <div className="flex-1 overflow-y-auto custom-scrollbar mt-1 pr-2">
                {treeOrFlattened.length > 0 ? (
                    treeOrFlattened.map(node => (
                        <TaskNode key={node.id} task={node} allTasks={tasks} level={isSearching ? 0 : 0} isFlattened={isSearching} />
                    ))
                ) : (
                    <div className="p-8 text-center text-zinc-600 italic text-xs">No tasks found in this view.</div>
                )}
            </div>
        </div>
    );
}

function TaskNode({ task, allTasks, level, isFlattened }: { task: Task, allTasks: Task[], level: number, isFlattened?: boolean }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isAddingSub, setIsAddingSub] = useState(false);

    const hasChildren = !isFlattened && task.children && task.children.length > 0;

    return (
        <div className="group/row">
            <div
                className={`flex items-center py-1.5 px-2 hover:bg-zinc-800/80 rounded-md border border-transparent hover:border-zinc-700/50 transition-all duration-200 ${level === 0 ? 'mb-1' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Column 1: Task Name (Tree) */}
                <div className="flex-1 flex items-center min-w-0 pr-4" style={{ paddingLeft: `${level * 16}px` }}>
                    {!isFlattened ? (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={`mr-1 p-0.5 rounded hover:bg-zinc-700 text-zinc-500 transition-colors ${!hasChildren ? 'invisible' : ''}`}
                        >
                            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                        </button>
                    ) : (
                        <div className="w-4 h-4 mr-1 flex items-center justify-center">
                            <Filter className="w-2.5 h-2.5 text-zinc-600" />
                        </div>
                    )}

                    <div className="truncate font-medium text-zinc-300 flex items-center gap-2">
                        <span className={task.status === 'done' ? 'line-through text-zinc-600' : ''}>{task.title}</span>
                        <div className={`flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity`}>
                            <TaskDependencySelector task={task} allTasks={allTasks} />
                            <TaskDetailSheet task={task} />
                            {!isFlattened && (
                                <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-blue-500/20 hover:text-blue-400" onClick={() => setIsAddingSub(true)} title="Add Subtask">
                                    <span className="text-xs">+</span>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Column 2: Status */}
                <div className="w-24 flex justify-center">
                    <form action={async () => {
                        const statuses: Task['status'][] = ['planned', 'doing', 'waiting', 'reviewing', 'done'];
                        const currentIndex = statuses.indexOf(task.status);
                        const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                        await updateTaskStatus(task.id, nextStatus as any);
                    }}>
                        <button>
                            <Badge variant="outline" className={`h-5 text-[9px] px-1.5 font-bold uppercase transition-colors cursor-pointer hover:bg-zinc-700 ${task.status === 'done' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                                task.status === 'doing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' :
                                    'text-zinc-500 border-zinc-800'
                                }`}>
                                {task.status}
                            </Badge>
                        </button>
                    </form>
                </div>

                {/* Column 3: Timeline */}
                <div className="w-32 flex items-center">
                    <TaskDatePicker taskId={task.id} startAt={task.startAt} endAt={task.endAt} />
                </div>

                {/* Column 4: Assignee (Mock) */}
                <div className="w-16 flex justify-center">
                    <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-600 transition-colors hover:border-zinc-500 cursor-help" title={task.assignee || "Unassigned"}>
                        {task.assignee ? task.assignee.slice(0, 1).toUpperCase() : <User className="w-3 h-3" />}
                    </div>
                </div>
            </div>

            {/* Subtask Input */}
            {isAddingSub && !isFlattened && (
                <div className="pl-8 py-2 ml-2 border-l border-zinc-800" style={{ paddingLeft: `${(level + 1) * 16}px` }}>
                    <form action={async (formData) => {
                        await createTask(formData);
                        setIsAddingSub(false);
                    }} className="flex gap-2">
                        <input type="hidden" name="parentId" value={task.id} />
                        <Input
                            name="title"
                            autoFocus
                            placeholder="Identify sub-task component..."
                            className="h-7 bg-zinc-950 rounded px-3 text-xs border border-zinc-800 focus:border-blue-500/50 w-80 shadow-inner"
                            onBlur={() => setTimeout(() => setIsAddingSub(false), 200)}
                        />
                    </form>
                </div>
            )}

            {/* Children */}
            {isExpanded && hasChildren && (
                <div className="border-l border-zinc-800/30 ml-4 pl-1">
                    {task.children!.map(child => (
                        <TaskNode key={child.id} task={child} allTasks={allTasks} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

