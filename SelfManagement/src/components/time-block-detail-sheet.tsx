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
import { useState } from "react";
import { format } from "date-fns";
import { Clock, MessageSquare, Plus, ExternalLink, Calendar, Target, CheckCircle2 } from "lucide-react";
import { ChatSection } from './chat-section';
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from 'next/link';

type TimeBlock = {
    id: string;
    startAt: Date;
    endAt: Date;
    type: 'plan' | 'actual';
    title?: string;
    notes?: string;
    taskToTimeBlocks: {
        task: { id: string, title: string, status: string }
    }[];
};

export function TimeBlockDetailSheet({ block, children }: { block: TimeBlock, children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    const taskTitles = block.taskToTimeBlocks.map(t => t.task.title).join(', ');
    const displayTitle = block.title || taskTitles || '(No Task)';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-[80vw] w-[1000px] h-[80vh] border-zinc-800 bg-zinc-950 text-zinc-100 p-0 flex flex-col overflow-hidden shadow-2xl">
                <DialogHeader className="p-6 border-b border-zinc-800 bg-zinc-900/40 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`${block.type === 'plan' ? 'text-blue-400 border-blue-500/30 bg-blue-500/5' : 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5'} font-bold uppercase tracking-widest text-[10px]`}>
                            {block.type === 'plan' ? 'PLANNED SESSION' : 'ACTUAL SESSION'}
                        </Badge>
                        <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-tighter">{block.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col text-left">
                            <DialogTitle className="text-2xl font-black tracking-tight text-zinc-100">{displayTitle}</DialogTitle>
                            <DialogDescription className="text-zinc-500 text-xs font-medium flex items-center gap-2 mt-1">
                                <Clock className="w-3.5 h-3.5" />
                                {format(new Date(block.startAt), 'EEEE, MMMM d')} | {format(new Date(block.startAt), 'HH:mm')} - {format(new Date(block.endAt), 'HH:mm')}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex">
                    <ScrollArea className="flex-1 h-full p-8 custom-scrollbar">
                        <div className="max-w-3xl mx-auto space-y-12 pb-12">
                            {/* Notes Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-5 h-5 text-zinc-500" />
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Session Notes</h3>
                                </div>
                                <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 min-h-[100px] text-sm text-zinc-300 leading-relaxed font-medium">
                                    {block.notes || <span className="italic opacity-50">No notes provided for this session.</span>}
                                </div>
                            </div>

                            {/* Linked Tasks Section */}
                            <div className="space-y-6 pt-8 border-t border-zinc-900">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Plus className="w-5 h-5 text-emerald-500" />
                                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-200">Associated Tasks</h3>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {block.taskToTimeBlocks.map((tt) => (
                                        <Link
                                            key={tt.task.id}
                                            href={`/tasks/${tt.task.id}`}
                                            className="group flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 transition-all shadow-lg"
                                        >
                                            <div className="flex flex-col gap-1">
                                                <div className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">{tt.task.title}</div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest text-zinc-500 py-0 h-4">{tt.task.status}</Badge>
                                                </div>
                                            </div>
                                            <ExternalLink className="w-4 h-4 text-zinc-700 group-hover:text-blue-400 transition-colors" />
                                        </Link>
                                    ))}
                                    {block.taskToTimeBlocks.length === 0 && (
                                        <div className="text-center py-8 border-2 border-dashed border-zinc-900 rounded-2xl text-xs font-bold text-zinc-700 uppercase tracking-widest">
                                            No tasks linked to this session
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Right Sidebar: Discussion */}
                    <div className="w-80 border-l border-zinc-800 flex flex-col bg-zinc-950/50 overflow-hidden">
                        <div className="p-6 border-b border-zinc-800 bg-zinc-900/20">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-zinc-500" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Live Coordination</h3>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <ChatSection timeBlockId={block.id} />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
