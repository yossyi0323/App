'use client';

import { BarChart3, ListTree, Settings, User, Download, LayoutDashboard, Clock, Keyboard } from "lucide-react";
import { ShortcutsDialog } from './shortcuts-dialog';
import { Button } from "./ui/button";
import { exportTasks } from "@/actions/export";

function ExportButton() {
    const handleExport = async () => {
        try {
            const md = await exportTasks();
            await navigator.clipboard.writeText(md);
            alert("Tasks exported to clipboard!");
        } catch (e) {
            console.error(e);
            alert("Failed to export.");
        }
    };

    return (
        <Button variant="ghost" onClick={handleExport} className="w-full justify-start gap-4 px-3 mb-1 text-zinc-400 hover:text-zinc-200">
            <Download className="w-5 h-5" suppressHydrationWarning />
            <span className="hidden lg:block">Export MD</span>
        </Button>
    );
}

import { NotificationBell } from './notification-bell';

export function AppSidebar() {
    return (
        <div suppressHydrationWarning className="w-[50px] lg:w-[240px] border-r border-zinc-800 bg-zinc-950 flex flex-col h-full">
            {/* Header/Logo */}
            <div className="h-14 flex items-center px-4 border-b border-zinc-800 shrink-0">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(255,255,255,0.2)]">S</div>
                <span className="ml-3 font-black tracking-tighter text-zinc-100 hidden lg:block text-lg">Self<span className="text-blue-500">Mgmt</span></span>
            </div>

            {/* Nav Items */}
            <div className="flex-1 py-6 space-y-2 px-3 overflow-y-auto custom-scrollbar">
                <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 px-2 hidden lg:block">Navigation</div>
                <NavItem icon={<LayoutDashboard className="w-5 h-5" suppressHydrationWarning />} label="Dashboard" href="/" />
                <NavItem icon={<ListTree className="w-5 h-5" suppressHydrationWarning />} label="Project Board" href="/board" />
                <NavItem icon={<Clock className="w-5 h-5" suppressHydrationWarning />} label="Timeline" href="/gantt" />
                <NavItem icon={<BarChart3 className="w-5 h-5" suppressHydrationWarning />} label="Schedule" href="/schedule" />
                <NavItem icon={<BarChart3 className="w-5 h-5" suppressHydrationWarning />} label="Task List" href="/tasks" />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 space-y-4 bg-zinc-900/20">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <ShortcutsDialog />
                        <NotificationBell />
                    </div>
                </div>

                <ExportButton />

                <div className="p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <User className="w-4 h-4 text-white" suppressHydrationWarning />
                    </div>
                    <div className="hidden lg:block">
                        <div className="text-xs font-black text-zinc-200">Yoshito</div>
                        <div className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Premium Plan</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import Link from "next/link"; // Import Link

// ...

function NavItem({ icon, label, active, href = "#" }: { icon: React.ReactNode, label: string, active?: boolean, href?: string }) {
    return (
        <Link href={href}>
            <Button variant="ghost" className={`w-full justify-start gap-4 px-3 mb-1 ${active ? 'bg-zinc-900 text-blue-400' : 'text-zinc-400 hover:text-zinc-200'}`}>
                {icon}
                <span className="hidden lg:block">{label}</span>
                {active && <div className="ml-auto w-1 h-1 bg-blue-500 rounded-full hidden lg:block" />}
            </Button>
        </Link>
    )
}
