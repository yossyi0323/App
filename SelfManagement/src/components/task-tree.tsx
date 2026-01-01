'use client';

import { createTask, deleteTask, updateTaskStatus } from '@/actions/tasks';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ChevronRight, ChevronDown, User, Calendar as CalendarIcon, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TaskDetailSheet } from './task-detail-sheet';

type Task = {
    id: string;
    title: string;
    status: 'planned' | 'doing' | 'waiting' | 'reviewing' | 'done';
    parentId: string | null;
    startAt: Date | null;
    endAt: Date | null;
    dependencies?: string[];
    children?: Task[];
};

import { TaskDatePicker } from './task-date-picker';
import { TaskDependencySelector } from './task-dependency-selector';


export function TaskTree({ tasks }: { tasks: Task[] }) {
    // We need flat list for dependency selector
    const allTasks = tasks;
    // Build tree hierarchy
    const buildTree = (taskList: Task[]): Task[] => {
        const taskMap = new Map<string, Task>();
        const roots: Task[] = [];

        // Initialize map
        taskList.forEach(t => taskMap.set(t.id, { ...t, children: [] }));

        // Connect parents
        taskList.forEach(t => {
            const task = taskMap.get(t.id)!;
            if (t.parentId && taskMap.has(t.parentId)) {
                taskMap.get(t.parentId)!.children!.push(task);
            } else {
                roots.push(task);
            }
        });

        return roots;
    };

    const tree = buildTree(tasks);

    return (
        <div className="w-full text-sm">
            {/* Table Header */}
            <div className="flex items-center px-2 py-2 border-b border-zinc-800 text-zinc-500 text-xs font-medium">
                <div className="flex-1 pl-8">Task Name</div>
                <div className="w-24 text-center">Status</div>
                <div className="w-32">timeline</div>
                <div className="w-16 text-center">Assignee</div>
            </div>

            {/* Rows */}
            <div className="mt-1">
                {tree.map(node => (
                    <TaskNode key={node.id} task={node} allTasks={allTasks} level={0} />
                ))}
            </div>
        </div>
    );
}

function TaskNode({ task, allTasks, level }: { task: Task, allTasks: Task[], level: number }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isAddingSub, setIsAddingSub] = useState(false);

    const hasChildren = task.children && task.children.length > 0;

    return (
        <div className="group/row">
            <div
                className={`flex items-center py-1.5 px-2 hover:bg-zinc-800/50 rounded border-b border-transparent hover:border-zinc-800/50 transition-colors ${level === 0 ? 'mb-1' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Column 1: Task Name (Tree) */}
                <div className="flex-1 flex items-center min-w-0 pr-4" style={{ paddingLeft: `${level * 16}px` }}>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`mr-1 p-0.5 rounded hover:bg-zinc-700 text-zinc-500 ${!hasChildren ? 'invisible' : ''}`}
                    >
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>

                    <div className="truncate font-medium text-zinc-300 flex items-center gap-2">
                        {task.title}
                        <div className={`flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity`}>
                            <TaskDependencySelector task={task} allTasks={allTasks} />
                            <TaskDetailSheet task={task} />
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsAddingSub(true)} title="Add Subtask">
                                <span className="text-xs">+</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Column 2: Status */}
                <div className="w-24 flex justify-center">
                    <form action={async () => {
                        const nextStatus = task.status === 'done' ? 'planned' : 'done';
                        await updateTaskStatus(task.id, nextStatus as any);
                    }}>
                        <button>
                            <Badge variant="outline" className={`h-5 text-[10px] px-1.5 font-normal cursor-pointer hover:bg-zinc-800 ${task.status === 'done' ? 'bg-green-900/30 text-green-400 border-green-900' : 'text-zinc-400 border-zinc-700'
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
                    <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] text-zinc-400 cursor-help" title="Unassigned">
                        <User className="w-3 h-3" />
                    </div>
                </div>
            </div>

            {/* Subtask Input */}
            {isAddingSub && (
                <div className="pl-8 py-1 ml-2 border-l border-zinc-800" style={{ paddingLeft: `${(level + 1) * 16}px` }}>
                    <form action={async (formData) => {
                        await createTask(formData);
                        setIsAddingSub(false);
                    }} className="flex gap-2">
                        <input type="hidden" name="parentId" value={task.id} />
                        <input
                            name="title"
                            autoFocus
                            placeholder="New subtask..."
                            className="bg-zinc-900 rounded px-2 py-1 text-xs border border-zinc-800 focus:border-blue-500 focus:outline-none w-64"
                            onBlur={() => setTimeout(() => setIsAddingSub(false), 200)} // Simple blur handling
                        />
                    </form>
                </div>
            )}

            {/* Children */}
            {isExpanded && hasChildren && (
                <div className="border-l border-zinc-800/30 ml-3.5">
                    {task.children!.map(child => (
                        <TaskNode key={child.id} task={child} allTasks={allTasks} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
