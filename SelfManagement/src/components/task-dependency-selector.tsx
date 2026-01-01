'use client';

import * as React from "react"
import { Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { addDependency, removeDependency } from "@/actions/dependencies"

type Task = { id: string; title: string; dependencies?: string[] };

export function TaskDependencySelector({ task, allTasks }: { task: Task, allTasks: Task[] }) {
    const [isOpen, setIsOpen] = React.useState(false);

    // Filter out self and children (to avoid obvious loops, though simplified)
    // For now just filter self.
    const candidates = allTasks.filter(t => t.id !== task.id);
    const currentDeps = task.dependencies || [];

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Link2 className={`h-3 w-3 ${currentDeps.length > 0 ? 'text-blue-500' : 'text-zinc-500'}`} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
                <div className="font-semibold text-xs mb-2 px-1">Select Predecessor (Blocking Task)</div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                    {candidates.map(candidate => {
                        const isSelected = currentDeps.includes(candidate.id);
                        return (
                            <div
                                key={candidate.id}
                                className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs ${isSelected ? 'bg-blue-900/30 text-blue-200' : 'hover:bg-zinc-800'
                                    }`}
                                onClick={async () => {
                                    if (isSelected) {
                                        await removeDependency(candidate.id, task.id);
                                    } else {
                                        await addDependency(candidate.id, task.id);
                                    }
                                }}
                            >
                                <div className={`w-3 h-3 border rounded-sm flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-zinc-600'
                                    }`}>
                                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-[1px]" />}
                                </div>
                                <span className="truncate">{candidate.title}</span>
                            </div>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
}
