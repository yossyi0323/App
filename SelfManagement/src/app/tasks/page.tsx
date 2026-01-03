
"use client"

import { useState, useEffect } from "react";
import { getTasks, TaskFilters } from "@/actions/tasks";
import { AppSidebar } from "@/components/app-sidebar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TaskDetailSheet } from "@/components/task-detail-sheet";
import { format } from "date-fns";
import { Search, Filter, MoreHorizontal, X } from "lucide-react";

export default function TasksPage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [filters, setFilters] = useState<TaskFilters>({
        search: "",
        status: "all",
        category: "",
        customPropKey: "",
        customPropValue: "",
        customPropEmpty: false
    });

    const fetchTasks = async () => {
        const data = await getTasks(filters);
        setTasks(data);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTasks();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [filters]);

    const updateFilter = (key: keyof TaskFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
            <AppSidebar />
            <div className="flex-1 flex flex-col h-full min-w-0">
                <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500">Workspace</span>
                        <span className="text-zinc-700">/</span>
                        <span className="font-medium text-blue-400">Advanced Task Search</span>
                    </div>
                </header>

                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                    {/* Filters Header */}
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 mb-6 space-y-4">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <Input
                                    placeholder="Search by title or description..."
                                    className="pl-10 bg-zinc-950/50 border-zinc-800 h-11"
                                    value={filters.search}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter('search', e.target.value)}
                                />
                            </div>
                            <select
                                className="bg-zinc-950/50 border border-zinc-800 rounded-md px-4 text-sm focus:outline-none h-11 w-40 text-zinc-300"
                                value={filters.status}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('status', e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="planned">Planned</option>
                                <option value="doing">Doing</option>
                                <option value="done">Done</option>
                            </select>
                            <select
                                className="bg-zinc-950/50 border border-zinc-800 rounded-md px-4 text-sm focus:outline-none h-11 w-40 text-zinc-300"
                                value={filters.category}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('category', e.target.value)}
                            >
                                <option value="">Any Category</option>
                                <option value="work">Work</option>
                                <option value="life">Life</option>
                                <option value="core">Core</option>
                            </select>
                        </div>

                        {/* JSONB / Custom Property Filters */}
                        <div className="flex items-center gap-4 pt-4 border-t border-zinc-800/50">
                            <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                                <Filter className="w-3 h-3" /> Custom Meta Search:
                            </div>
                            <Input
                                placeholder="Property Key (e.g. MergeRequestURL)"
                                className="w-64 bg-zinc-950/50 border-zinc-800 h-9 text-xs"
                                value={filters.customPropKey}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter('customPropKey', e.target.value)}
                            />
                            <div className="flex items-center gap-4">
                                <Input
                                    placeholder="Value matches..."
                                    className="w-48 bg-zinc-950/50 border-zinc-800 h-9 text-xs disabled:opacity-30"
                                    value={filters.customPropValue}
                                    disabled={filters.customPropEmpty}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter('customPropValue', e.target.value)}
                                />
                                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        className="w-3 h-3 rounded border-zinc-800 bg-zinc-950 accent-blue-500"
                                        checked={filters.customPropEmpty}
                                        onChange={(e) => updateFilter('customPropEmpty', e.target.checked)}
                                    />
                                    is Empty / Null
                                </label>
                            </div>

                            <button
                                onClick={() => setFilters({ search: "", status: "all", category: "", customPropKey: "", customPropValue: "", customPropEmpty: false })}
                                className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                            >
                                <X className="w-3 h-3" /> Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="flex-1 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/10">
                        <div className="overflow-auto h-full custom-scrollbar">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-[10px] tracking-widest sticky top-0 backdrop-blur-sm z-10 transition-colors">
                                    <tr>
                                        <th className="px-6 py-4 font-bold border-b border-zinc-800">Task Title</th>
                                        <th className="px-6 py-4 font-bold border-b border-zinc-800 w-32">Status</th>
                                        <th className="px-6 py-4 font-bold border-b border-zinc-800 w-32">Category</th>
                                        <th className="px-6 py-4 font-bold border-b border-zinc-800 w-44">Timeline</th>
                                        <th className="px-6 py-4 font-bold border-b border-zinc-800 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/30">
                                    {tasks.map(task => (
                                        <tr key={task.id} className="hover:bg-zinc-800/30 group transition-colors">
                                            <td className="px-6 py-4 font-medium text-zinc-200">
                                                <div className="flex flex-col">
                                                    <span>{task.title}</span>
                                                    {task.objective && <span className="text-[11px] text-zinc-500 font-normal line-clamp-1 mt-1">{task.objective}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className={`
                                                    rounded-full px-3 py-0 h-6 text-[10px] font-medium tracking-tight
                                                    ${task.status === 'done' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                                        task.status === 'doing' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                                            task.status === 'reviewing' ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                                                                'bg-zinc-800/50 border-zinc-700 text-zinc-500'}
                                                `}>
                                                    {task.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {task.category && (
                                                    <span className="text-[11px] text-zinc-500 capitalize bg-zinc-800/30 px-2 py-0.5 rounded border border-zinc-800/50">
                                                        {task.category}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-zinc-500 text-[11px] font-mono whitespace-nowrap">
                                                {task.startAt ? format(new Date(task.startAt), 'yyyy-MM-dd') : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <TaskDetailSheet task={task} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {tasks.length === 0 && (
                                <div className="p-20 text-center flex flex-col items-center justify-center space-y-3">
                                    <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-700">
                                        <Filter className="w-6 h-6" />
                                    </div>
                                    <div className="text-sm text-zinc-500 font-medium italic">No tasks found matching your criteria.</div>
                                    <button
                                        onClick={() => setFilters({ search: "", status: "all", category: "", customPropKey: "", customPropValue: "", customPropEmpty: false })}
                                        className="text-xs text-blue-500 hover:underline"
                                    >
                                        Reset all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
