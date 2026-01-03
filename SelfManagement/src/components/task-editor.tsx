'use client';

import { useState } from 'react';
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Save,
    ChevronLeft,
    Clock,
    Calendar,
    User,
    Tag,
    CheckCircle2,
    Layout,
    ArrowLeft,
    Plus,
    Trash2,
    Link as LinkIcon
} from "lucide-react";
import { format } from "date-fns";
import { updateTaskDetails } from "@/actions/task-details";
import { useRouter } from 'next/navigation';
import { TaskDependencySelector } from './task-dependency-selector';
import { ChatSection } from './chat-section';

type Task = any;

export function TaskEditor({ task, allTasks }: { task: Task, allTasks: Task[] }) {
    const router = useRouter();
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [objective, setObjective] = useState(task.objective || '');
    const [outputDefinition, setOutputDefinition] = useState(task.outputDefinition || '');
    const [isSaving, setIsSaving] = useState(false);

    // Custom Properties State
    const [properties, setProperties] = useState<{ key: string, value: string, type: string }[]>(() => {
        if (!task.customProperties) return [];
        if (Array.isArray(task.customProperties)) {
            return task.customProperties.map((p: any) => ({
                key: p.key,
                value: String(p.value),
                type: p.type || 'text'
            }));
        }
        return Object.entries(task.customProperties).map(([key, value]) => ({ key, value: String(value), type: 'text' }));
    });

    const addProperty = () => setProperties([...properties, { key: '', value: '', type: 'text' }]);
    const removeProperty = (index: number) => setProperties(properties.filter((_, i) => i !== index));
    const updateProperty = (index: number, field: 'key' | 'value' | 'type', value: string) => {
        const newProps = [...properties];
        newProps[index][field] = value;
        if (field === 'type') {
            if (value === 'checkbox') newProps[index].value = 'false';
            else if (value === 'date') newProps[index].value = '';
        }
        setProperties(newProps);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description || '');
        formData.append('objective', objective);
        formData.append('outputDefinition', outputDefinition);
        formData.append('customProperties', JSON.stringify(properties));

        try {
            await updateTaskDetails(task.id, formData);
            router.refresh();
        } catch (error) {
            console.error("Save failed", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
            {/* Top Bar */}
            <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-xl z-30 sticky top-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-zinc-500 hover:text-white hover:bg-zinc-900">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest text-blue-400 border-blue-500/30 bg-blue-500/5">{task.status}</Badge>
                            <span className="text-[10px] text-zinc-600 font-mono tracking-tighter uppercase">{task.id}</span>
                        </div>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-transparent border-none text-lg font-bold p-0 focus:outline-none focus:ring-0 w-[500px] placeholder:text-zinc-700"
                            placeholder="Identify project core component..."
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-xs text-zinc-500 mr-4 font-medium italic">
                        Last edited {format(new Date(task.updatedAt), 'MMM d, HH:mm')}
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-white text-black hover:bg-zinc-200 font-bold px-6 h-9 rounded-full shadow-lg shadow-white/5"
                    >
                        {isSaving ? <span className="animate-spin mr-2">◌</span> : <Save className="w-4 h-4 mr-2" />}
                        {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Settings & Properties */}
                <aside className="w-80 border-r border-zinc-800 p-6 overflow-y-auto custom-scrollbar bg-zinc-950/30">
                    <div className="space-y-8">
                        {/* Meta Info */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Context</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm group cursor-help">
                                    <User className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                                    <span className="text-zinc-400">Assignee</span>
                                    <span className="ml-auto text-zinc-300 font-medium">{task.assignee || 'Unassigned'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm group">
                                    <Tag className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                                    <span className="text-zinc-400">Category</span>
                                    <span className="ml-auto text-zinc-300 font-medium uppercase text-[10px]">{task.category || 'Core'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm group">
                                    <LinkIcon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                                    <span className="text-zinc-400">Dependencies</span>
                                    <div className="ml-auto">
                                        <TaskDependencySelector task={task} allTasks={allTasks} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Objectives */}
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Objective (Why)</h3>
                            <textarea
                                value={objective}
                                onChange={(e) => setObjective(e.target.value)}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-xs min-h-[100px] focus:border-zinc-700 transition-all placeholder:text-zinc-700"
                                placeholder="Purpose and rationale of this task..."
                            />
                        </div>

                        {/* Custom Properties */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Properties</h3>
                                <Button variant="ghost" size="icon" onClick={addProperty} className="h-6 w-6 text-zinc-500 hover:text-white">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {properties.map((prop, index) => (
                                    <div key={index} className="space-y-1.5 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800 group relative">
                                        <div className="flex items-center gap-2">
                                            <input
                                                value={prop.key}
                                                onChange={(e) => updateProperty(index, 'key', e.target.value)}
                                                className="bg-transparent border-none text-[11px] font-bold p-0 focus:outline-none w-full text-zinc-300 uppercase tracking-widest placeholder:text-zinc-700"
                                                placeholder="KEY"
                                            />
                                            <button onClick={() => removeProperty(index)} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            {prop.type === 'checkbox' ? (
                                                <input
                                                    type="checkbox"
                                                    checked={prop.value === 'true'}
                                                    onChange={(e) => updateProperty(index, 'value', String(e.target.checked))}
                                                    className="w-4 h-4 accent-white"
                                                />
                                            ) : (
                                                <input
                                                    value={prop.value}
                                                    onChange={(e) => updateProperty(index, 'value', e.target.value)}
                                                    className="bg-transparent border-none text-xs p-0 focus:outline-none w-full text-zinc-400 placeholder:text-zinc-800"
                                                    placeholder="Value..."
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Planned Sessions */}
                        {task.linkedTimeBlocks && task.linkedTimeBlocks.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Planned Sessions</h3>
                                <div className="space-y-2">
                                    {task.linkedTimeBlocks.map((block: any) => (
                                        <div key={block.id} className="flex flex-col p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 gap-1">
                                            <div className="text-[11px] font-bold text-blue-400 uppercase tracking-tighter">{block.title || 'Work Session'}</div>
                                            <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(block.startAt), 'MMM d, HH:mm')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Discussion */}
                        <div className="pt-4">
                            <ChatSection taskId={task.id} />
                        </div>
                    </div>
                </aside >

                {/* Editor Area */}
                < div className="flex-1 flex flex-col min-w-0 bg-zinc-950" >
                    <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                        <div className="max-w-4xl mx-auto space-y-12">
                            {/* Markdown Editor */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Layout className="w-5 h-5 text-blue-500" />
                                    <h2 className="text-xl font-black uppercase tracking-widest text-zinc-200">Execution Plan</h2>
                                </div>
                                <div data-color-mode="dark" className="immersive-editor">
                                    <MDEditor
                                        value={description}
                                        onChange={setDescription}
                                        height={600}
                                        preview="edit"
                                        style={{ backgroundColor: 'transparent', border: 'none' }}
                                        textareaProps={{
                                            placeholder: 'Deep dive into the implementation details, architecture, and notes...'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Output Definition */}
                            <div className="pt-12 border-t border-zinc-900 space-y-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <h2 className="text-xl font-black uppercase tracking-widest text-zinc-200">Definition of Done</h2>
                                </div>
                                <textarea
                                    value={outputDefinition}
                                    onChange={(e) => setOutputDefinition(e.target.value)}
                                    className="w-full bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 text-sm min-h-[150px] focus:border-zinc-700 transition-all font-medium leading-relaxed placeholder:text-zinc-800"
                                    placeholder="Enumerate the specific completion criteria..."
                                />
                            </div>
                        </div>
                    </div>
                </div >
            </main >
        </div >
    );
}
