'use client';

import { useState, useEffect } from 'react';
import { getNotifications, markNotificationRead } from '@/actions/communication';
import { Bell, Check, Info, UserPlus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const fetchNotifications = async () => {
        const data = await getNotifications();
        setNotifications(data);
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // 30s polling
        return () => clearInterval(interval);
    }, []);

    const handleRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await markNotificationRead(id);
        fetchNotifications();
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative cursor-pointer group">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 hover:border-zinc-700 transition-all group-active:scale-95 shadow-lg">
                        <Bell className={`w-4 h-4 transition-colors ${unreadCount > 0 ? 'text-blue-400 animate-pulse' : 'text-zinc-500 group-hover:text-zinc-300'}`} suppressHydrationWarning />
                    </div>
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center bg-blue-500 text-white text-[8px] font-black border-2 border-zinc-950 rounded-full animate-in zoom-in-50 duration-300">
                            {unreadCount}
                        </Badge>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-zinc-950 border-zinc-800 shadow-2xl overflow-hidden rounded-2xl" align="end">
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Notifications</h3>
                    <Badge variant="outline" className="text-[9px] border-zinc-800 text-zinc-500 font-bold">{unreadCount} UNREAD</Badge>
                </div>
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center justify-center space-y-3 opacity-30">
                            <Bell className="w-8 h-8 text-zinc-600" suppressHydrationWarning />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">All caught up</p>
                        </div>
                    )}
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`p-4 border-b border-zinc-900/50 hover:bg-white/[0.02] flex gap-3 transition-colors ${!n.isRead ? 'bg-blue-500/[0.03]' : ''}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'mention' ? 'bg-amber-500/10 text-amber-500' :
                                n.type === 'assignment' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                                }`}>
                                {n.type === 'mention' && <AtSign className="w-4 h-4" suppressHydrationWarning />}
                                {n.type === 'assignment' && <UserPlus className="w-4 h-4" suppressHydrationWarning />}
                                {n.type === 'comment' && <MessageSquare className="w-4 h-4" suppressHydrationWarning />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-zinc-300 leading-snug line-clamp-2">{n.content}</p>
                                <p className="text-[10px] text-zinc-600 font-bold mt-1 uppercase">{formatDistanceToNow(new Date(n.createdAt))} ago</p>
                            </div>
                            {!n.isRead && (
                                <button
                                    onClick={(e) => handleRead(n.id, e)}
                                    className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all scale-75"
                                >
                                    <Check className="w-3.5 h-3.5" suppressHydrationWarning />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}

import { AtSign } from 'lucide-react';
