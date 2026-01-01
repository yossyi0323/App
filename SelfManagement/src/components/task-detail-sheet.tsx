'use client';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetTrigger
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { updateTaskDetails } from "@/actions/task-details";
import { useState } from "react";
import { MoreHorizontal, Plus, Trash2 } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

type Task = any; // Simplified for brevity

export function TaskDetailSheet({ task, children }: { task: Task, children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [description, setDescription] = useState<string | undefined>(task.description || '');

    // Custom Properties State
    const [properties, setProperties] = useState<{ key: string, value: string, type: string }[]>(() => {
        if (!task.customProperties) return [];
        if (Array.isArray(task.customProperties)) {
            // Migration: if items missing type, default to text
            return task.customProperties.map((p: any) => ({
                key: p.key,
                value: String(p.value),
                type: p.type || 'text'
            }));
        }
        // Fallback for old object format
        return Object.entries(task.customProperties).map(([key, value]) => ({ key, value: String(value), type: 'text' }));
    });

    const addProperty = () => setProperties([...properties, { key: '', value: '', type: 'text' }]);
    const removeProperty = (index: number) => setProperties(properties.filter((_, i) => i !== index));
    const updateProperty = (index: number, field: 'key' | 'value' | 'type', value: string) => {
        const newProps = [...properties];
        newProps[index][field] = value;
        // Reset value if type changes to checkbox for easier handling?
        if (field === 'type') {
            if (value === 'checkbox') newProps[index].value = 'false';
            else if (value === 'date') newProps[index].value = '';
        }
        setProperties(newProps);
    };

    // Serialize for form: We now save the entire array structure to preserve types
    // Format: JSON string of array objects
    const customPropertiesJson = JSON.stringify(properties);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[600px] border-l border-zinc-800 bg-zinc-950 text-zinc-100 p-0 flex flex-col">
                <SheetHeader className="p-6 border-b border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-zinc-400 border-zinc-700">{task.status}</Badge>
                        <span className="text-xs text-zinc-500 font-mono">{task.id.slice(0, 8)}</span>
                    </div>
                    <SheetTitle className="text-xl font-bold">{task.title}</SheetTitle>
                    <SheetDescription>Task Details</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <form action={async (formData) => {
                        await updateTaskDetails(task.id, formData);
                        setOpen(false);
                    }} id="task-detail-form" className="space-y-6">

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Objective (Why)</label>
                            <textarea
                                name="objective"
                                defaultValue={task.objective || ''}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-sm min-h-[80px] focus:outline-none focus:border-zinc-700"
                                placeholder="What is the goal and why is it important?"
                            />
                        </div>

                        {/* Custom Properties */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-zinc-400">Custom Properties</label>
                                <Button type="button" variant="outline" size="sm" onClick={addProperty} className="h-7 text-xs border-zinc-700 hover:bg-zinc-800">
                                    <Plus className="w-3 h-3 mr-1" /> Add Field
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {properties.map((prop, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <select
                                            className="w-[80px] bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm focus:border-zinc-700 focus:outline-none appearance-none text-zinc-400"
                                            value={prop.type}
                                            onChange={(e) => updateProperty(index, 'type', e.target.value)}
                                        >
                                            <option value="text">Text</option>
                                            <option value="url">URL</option>
                                            <option value="date">Date</option>
                                            <option value="checkbox">Chk</option>
                                        </select>
                                        <input
                                            placeholder="Key"
                                            className="w-1/4 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm focus:border-zinc-700 focus:outline-none"
                                            value={prop.key}
                                            onChange={(e) => updateProperty(index, 'key', e.target.value)}
                                        />

                                        {/* Dynamic Input based on Type */}
                                        {prop.type === 'checkbox' ? (
                                            <div className="flex-1 flex items-center h-[30px] border border-zinc-800 rounded px-2 bg-zinc-900">
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
                                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm focus:border-zinc-700 focus:outline-none"
                                                value={prop.value}
                                                onChange={(e) => updateProperty(index, 'value', e.target.value)}
                                            />
                                        ) : (
                                            <input
                                                placeholder={prop.type === 'url' ? 'https://...' : 'Value'}
                                                className={`flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm focus:border-zinc-700 focus:outline-none ${prop.type === 'url' ? 'text-blue-400 underline decoration-blue-800/50' : ''}`}
                                                value={prop.value}
                                                onChange={(e) => updateProperty(index, 'value', e.target.value)}
                                            />
                                        )}

                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeProperty(index)} className="h-8 w-8 text-zinc-500 hover:text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {properties.length === 0 && <div className="text-xs text-zinc-600 italic">No custom properties defined.</div>}
                                <input type="hidden" name="customProperties" value={customPropertiesJson} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Description / Notes (Markdown)</label>
                            <div data-color-mode="dark">
                                <MDEditor
                                    value={description}
                                    onChange={setDescription}
                                    height={300}
                                    style={{ backgroundColor: '#09090b', border: '1px solid #27272a' }}
                                    preview="edit"
                                />
                                <input type="hidden" name="description" value={description || ''} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Output Definition</label>
                            <textarea
                                name="outputDefinition"
                                defaultValue={task.outputDefinition || ''}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded p-3 text-sm min-h-[80px] focus:outline-none focus:border-zinc-700"
                                placeholder="What does 'Done' look like?"
                            />
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-zinc-800 bg-zinc-950">
                    <Button type="submit" form="task-detail-form" className="w-full bg-white text-black hover:bg-zinc-200">Save Changes</Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
