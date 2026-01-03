'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { updateTaskDetails } from "@/actions/task-details";
import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Plus, Trash2, Maximize2, MessageSquare, Layout, CheckCircle2, Target } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import { ChatSection } from './chat-section';
import Link from 'next/link';
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { createTimeBlock } from "@/actions/schedule";

type Task = any;

export function TaskDetailSheet({ task, children }: { task: Task, children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [description, setDescription] = useState(task.description || '');
    const [objective, setObjective] = useState(task.objective || '');
    const [outputDefinition, setOutputDefinition] = useState(task.outputDefinition || '');

    // Add Session State
    const [newSession, setNewSession] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endTime: '10:00',
        title: 'Work Session'
    });
    const [isAddingSession, setIsAddingSession] = useState(false);

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
    const handleAddSession = async () => {
        setIsAddingSession(true);
        try {
            const startAt = new Date(`${newSession.date}T${newSession.startTime}`);
            const endAt = new Date(`${newSession.date}T${newSession.endTime}`);

            const formData = new FormData();
            formData.append('title', newSession.title);
            formData.append('startAt', startAt.toISOString());
            formData.append('endAt', endAt.toISOString());
            formData.append('type', 'plan');
            formData.append('taskIds', JSON.stringify([task.id]));

            await createTimeBlock(formData);

            // Reset to defaults but keep date
            setNewSession(prev => ({ ...prev, title: 'Work Session', startTime: '09:00', endTime: '10:00' }));
        } catch (error) {
            console.error(error);
        } finally {
            setIsAddingSession(false);
        }
    };

    const updateProperty = (index: number, field: 'key' | 'value' | 'type', value: string) => {
        const newProps = [...properties];
        newProps[index][field] = value;
        if (field === 'type') {
            if (value === 'checkbox') newProps[index].value = 'false';
            else if (value === 'date') newProps[index].value = '';
        }
        setProperties(newProps);
    };

    const customPropertiesJson = JSON.stringify(properties);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] w-[1200px] h-[90vh] border-zinc-800 bg-zinc-950 text-zinc-100 p-0 flex flex-col overflow-hidden shadow-2xl">
                <DialogHeader className="p-6 border-b border-zinc-800 bg-zinc-900/40 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-blue-400 border-blue-500/30 bg-blue-500/5 font-bold uppercase tracking-widest text-[10px]">{task.status}</Badge>
                        <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter">{task.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col text-left">
                            <DialogTitle className="text-2xl font-black tracking-tight text-zinc-100">{task.title}</DialogTitle>
                            <DialogDescription className="text-zinc-500 text-xs font-medium">Immersive Task Workspace</DialogDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 text-[10px] font-black uppercase tracking-widest border-zinc-800 hover:bg-zinc-900 gap-2 px-4 rounded-full"
                                onClick={() => window.location.href = `/tasks/${task.id}`}
                            >
                                <Maximize2 className="w-3.5 h-3.5" /> Full Screen
                            </Button>
                            <Button
                                type="submit"
                                form="task-detail-form"
                                className="h-9 px-6 bg-white text-black hover:bg-zinc-200 font-black text-[10px] uppercase tracking-widest rounded-full shadow-lg shadow-white/5"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex">
                    <ScrollArea className="flex-1 h-full p-8 custom-scrollbar">
                        <div className="max-w-4xl mx-auto space-y-12 pb-12">
                            <form action={async (formData) => {
                                await updateTaskDetails(task.id, formData);
                                setOpen(false);
                            }} id="task-detail-form" className="space-y-12">

                                {/* Section: Objective */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="w-5 h-5 text-blue-500" />
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-200">Objective (Why)</h3>
                                    </div>
                                    <div data-color-mode="dark">
                                        <MDEditor
                                            value={objective}
                                            onChange={(val) => setObjective(val || '')}
                                            height={200}
                                            style={{ backgroundColor: 'transparent', border: '1px solid #27272a', borderRadius: '12px' }}
                                            preview="edit"
                                            textareaProps={{
                                                placeholder: "What is the goal and why is it important?"
                                            }}
                                        />
                                        <input type="hidden" name="objective" value={objective} />
                                    </div>
                                </div>

                                {/* Section: Description */}
                                <div className="space-y-4 pt-8 border-t border-zinc-900">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Layout className="w-5 h-5 text-emerald-500" />
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-200">Execution Plan (How)</h3>
                                    </div>
                                    <div data-color-mode="dark">
                                        <MDEditor
                                            value={description}
                                            onChange={setDescription}
                                            height={400}
                                            style={{ backgroundColor: 'transparent', border: '1px solid #27272a', borderRadius: '12px' }}
                                            preview="edit"
                                        />
                                        <input type="hidden" name="description" value={description || ''} />
                                    </div>
                                </div>

                                {/* Section: Output Definition */}
                                <div className="space-y-4 pt-8 border-t border-zinc-900">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="w-5 h-5 text-purple-500" />
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-200">Definition of Done</h3>
                                    </div>
                                    <div data-color-mode="dark">
                                        <MDEditor
                                            value={outputDefinition}
                                            onChange={(val) => setOutputDefinition(val || '')}
                                            height={200}
                                            style={{ backgroundColor: 'transparent', border: '1px solid #27272a', borderRadius: '12px' }}
                                            preview="edit"
                                            textareaProps={{
                                                placeholder: "What does 'Done' look like?"
                                            }}
                                        />
                                        <input type="hidden" name="outputDefinition" value={outputDefinition} />
                                    </div>
                                </div>

                                {/* Custom Properties */}
                                <div className="space-y-6 pt-8 border-t border-zinc-900">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-200">Custom Properties</h3>
                                        <Button type="button" variant="outline" size="sm" onClick={addProperty} className="h-8 text-[10px] font-black border-zinc-800 hover:bg-zinc-900 rounded-full px-4">
                                            <Plus className="w-3.5 h-3.5 mr-1.5" /> ADD FIELD
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {properties.map((prop, index) => (
                                            <div key={index} className="flex gap-2 items-center p-3 rounded-xl bg-zinc-900/30 border border-zinc-800">
                                                <select
                                                    className="w-[80px] bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-black uppercase focus:border-zinc-700 focus:outline-none appearance-none text-zinc-500"
                                                    value={prop.type}
                                                    onChange={(e) => updateProperty(index, 'type', e.target.value)}
                                                >
                                                    <option value="text">TEXT</option>
                                                    <option value="url">URL</option>
                                                    <option value="date">DATE</option>
                                                    <option value="checkbox">CHK</option>
                                                </select>
                                                <input
                                                    placeholder="Key"
                                                    className="w-1/3 bg-transparent border-none text-xs font-bold focus:outline-none placeholder:text-zinc-800 uppercase tracking-widest"
                                                    value={prop.key}
                                                    onChange={(e) => updateProperty(index, 'key', e.target.value)}
                                                />

                                                {/* Dynamic Input based on Type */}
                                                {prop.type === 'checkbox' ? (
                                                    <div className="flex-1 flex items-center h-full justify-end">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 accent-blue-500"
                                                            checked={prop.value === 'true'}
                                                            onChange={(e) => updateProperty(index, 'value', String(e.target.checked))}
                                                        />
                                                    </div>
                                                ) : prop.type === 'date' ? (
                                                    <input
                                                        type="date"
                                                        className="flex-1 bg-transparent border-none text-xs focus:outline-none text-zinc-400"
                                                        value={prop.value}
                                                        onChange={(e) => updateProperty(index, 'value', e.target.value)}
                                                    />
                                                ) : (
                                                    <input
                                                        placeholder={prop.type === 'url' ? 'https://...' : 'Value'}
                                                        className={`flex-1 bg-transparent border-none text-xs focus:outline-none ${prop.type === 'url' ? 'text-blue-400 underline decoration-blue-800/50' : 'text-zinc-400'}`}
                                                        value={prop.value}
                                                        onChange={(e) => updateProperty(index, 'value', e.target.value)}
                                                    />
                                                )}

                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeProperty(index)} className="h-8 w-8 text-zinc-700 hover:text-red-400 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    {properties.length === 0 && <div className="text-xs text-zinc-700 italic font-medium">No custom properties defined.</div>}
                                    <input type="hidden" name="customProperties" value={customPropertiesJson} />
                                </div>
                            </form>
                        </div>
                    </ScrollArea>

                    {/* Right Sidebar: Context & Discussion */}
                    <div className="w-96 border-l border-zinc-800 flex flex-col bg-zinc-950/50 overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            {/* Planned Work Sessions */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Planned Work Sessions</h3>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-700 hover:text-white">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-4 bg-zinc-950 border border-zinc-800 shadow-2xl mr-4" align="end">
                                            <div className="space-y-4">
                                                <h4 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">New Session</h4>
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500/50"
                                                        value={newSession.title}
                                                        onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                                                        placeholder="Session Title"
                                                    />
                                                    <input
                                                        type="date"
                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500/50"
                                                        value={newSession.date}
                                                        onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                                                    />
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="time"
                                                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500/50"
                                                            value={newSession.startTime}
                                                            onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                                                        />
                                                        <input
                                                            type="time"
                                                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500/50"
                                                            value={newSession.endTime}
                                                            onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                                                        />
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        disabled={isAddingSession}
                                                        onClick={handleAddSession}
                                                        className="w-full h-7 text-[10px] font-bold uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white"
                                                    >
                                                        {isAddingSession ? 'Adding...' : 'Add to Schedule'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-3">
                                    {task.linkedTimeBlocks && task.linkedTimeBlocks.length > 0 ? (
                                        task.linkedTimeBlocks.map((block: any) => (
                                            <div key={block.id} className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 relative group transition-all hover:bg-zinc-900 hover:border-zinc-700 shadow-lg">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="text-[11px] font-black text-blue-400 uppercase tracking-tighter truncate pr-6">{block.title || 'Work Session'}</div>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
                                                        <Plus className="w-3 h-3 rotate-45" /> {/* Placeholder for a better icon */}
                                                        {format(new Date(block.startAt), 'MMM d, HH:mm')} - {format(new Date(block.endAt), 'HH:mm')}
                                                    </div>
                                                </div>
                                                <button className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-all scale-75 group-hover:scale-100">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest text-center py-8 border-2 border-dashed border-zinc-900 rounded-2xl">No linked sessions</div>
                                    )}
                                </div>
                            </div>

                            {/* Discussion Section */}
                            <div className="space-y-4 pt-8 border-t border-zinc-900">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-zinc-600" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Discussion</h3>
                                </div>
                                <div className="bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden shadow-inner">
                                    <ChatSection taskId={task.id} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
