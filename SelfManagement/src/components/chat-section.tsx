'use client';

import { useState, useEffect } from 'react';
import { getComments, addComment } from '@/actions/communication';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { MessageSquare, Send, User, AtSign } from 'lucide-react';

interface Comment {
    id: string;
    senderId: string;
    content: string;
    createdAt: Date;
}

export function ChatSection({ taskId, timeBlockId }: { taskId?: string, timeBlockId?: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSending, setIsSending] = useState(false);

    const fetchComments = async () => {
        const data = await getComments(taskId, timeBlockId);
        setComments(data as any);
    };

    useEffect(() => {
        fetchComments();
        const interval = setInterval(fetchComments, 10000); // Polling for now
        return () => clearInterval(interval);
    }, [taskId, timeBlockId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent parent form submission
        if (!newComment.trim() || isSending) return;

        setIsSending(true);
        try {
            const formData = new FormData();
            if (taskId) formData.append('taskId', taskId);
            if (timeBlockId) formData.append('timeBlockId', timeBlockId);
            formData.append('content', newComment);

            await addComment(formData);
            setNewComment("");
            await fetchComments();
        } catch (err) {
            console.error("Failed to send comment", err);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[400px] bg-zinc-900/20 border border-zinc-800 rounded-2xl overflow-hidden shadow-inner">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Discussion</h3>
                </div>
                <div className="text-[9px] font-bold text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    {comments.length} Messages
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-zinc-950/20">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group animate-in slide-in-from-bottom-2 duration-300">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700 shadow-lg">
                            <User className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-zinc-300">{comment.senderId}</span>
                                <span className="text-[10px] text-zinc-600 font-medium">{format(new Date(comment.createdAt), 'HH:mm')}</span>
                            </div>
                            <div className="text-sm text-zinc-400 leading-relaxed break-words bg-zinc-900/50 p-2 rounded-lg border border-transparent group-hover:border-zinc-800 group-hover:bg-zinc-900/80 transition-all">
                                {comment.content.split(' ').map((word, i) =>
                                    word.startsWith('@') ? <span key={i} className="text-blue-400 font-bold bg-blue-400/10 px-1 rounded-sm">{word} </span> : word + ' '
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {comments.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700 space-y-2 opacity-50">
                        <MessageSquare className="w-8 h-8" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">No conversation yet</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
                <div className="relative group">
                    <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Type message or @mention..."
                        className="bg-zinc-900 border-zinc-800 pr-12 focus:ring-1 focus:ring-blue-500/50 text-xs h-10 rounded-xl transition-all"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isSending || !newComment.trim()}
                        className="absolute right-1 top-1 h-8 w-8 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-30"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
