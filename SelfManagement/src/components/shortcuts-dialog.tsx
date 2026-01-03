'use client';

import { useState, useEffect, useRef } from 'react';
import { useShortcuts } from './shortcut-provider';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard, X, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ShortcutsDialog() {
    const { shortcuts, updateKeys } = useShortcuts();
    const [recordingId, setRecordingId] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    // Key recording logic
    useEffect(() => {
        if (!recordingId) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const keys: string[] = [];
            if (e.ctrlKey) keys.push('ctrl');
            if (e.shiftKey) keys.push('shift');
            if (e.altKey) keys.push('alt');
            if (e.metaKey) keys.push('meta');

            // Avoid adding modifier keys on their own
            const isModifier = ['Control', 'Shift', 'Alt', 'Meta'].includes(e.key);
            if (!isModifier) {
                // Map some keys to standard names
                const keyName = e.key === ' ' ? 'space' : e.key.toLowerCase();
                keys.push(keyName);

                updateKeys(recordingId, keys.join('+'));
                setRecordingId(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [recordingId, updateKeys]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button suppressHydrationWarning variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-full" title="Keyboard Shortcuts">
                    <Keyboard className="w-5 h-5" suppressHydrationWarning />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-6 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl">
                    <DialogTitle className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                        <Keyboard className="w-6 h-6 text-blue-500" suppressHydrationWarning />
                        Shortcuts
                    </DialogTitle>
                </DialogHeader>

                <div className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar bg-[linear-gradient(to_bottom,rgba(9,9,11,1),rgba(24,24,27,0.5))]">
                    <div className="grid gap-1">
                        {shortcuts.map((s) => (
                            <div key={s.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors group">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold tracking-tight text-zinc-200">{s.description}</span>
                                    <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest mt-0.5">{s.id}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setRecordingId(recordingId === s.id ? null : s.id)}
                                        className={`px-3 py-1.5 rounded-lg border font-mono text-xs transition-all duration-200 min-w-[80px] text-center shadow-lg
                                            ${recordingId === s.id
                                                ? 'bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse ring-2 ring-blue-500/20'
                                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:border-zinc-700'}`}
                                    >
                                        {recordingId === s.id ? 'PRESS KEYS...' : s.keys.toUpperCase()}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
                    <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-medium italic">
                        <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="h-4 px-1 py-0 border-zinc-800 text-[9px] text-zinc-600">Click</Badge>
                            a keys badge to rebind.
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
