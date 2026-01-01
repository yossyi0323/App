'use client';

import { BarChart3, ListTree, Settings, User, Download } from "lucide-react";
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
            <Download className="w-5 h-5" />
            <span className="hidden lg:block">Export MD</span>
        </Button>
    );
}

export function AppSidebar() {
    return (
        <div className="w-[50px] lg:w-[240px] border-r border-zinc-800 bg-zinc-950 flex flex-col h-full">
            {/* Header/Logo */}
            <div className="h-14 flex items-center px-4 border-b border-zinc-800">
                <div className="w-8 h-8 bg-zinc-100 rounded flex items-center justify-center text-black font-bold text-xl">S</div>
                <span className="ml-3 font-semibold text-zinc-100 hidden lg:block">SelfMgmt</span>
            </div>

            {/* Nav Items */}
            <div className="flex-1 py-4 space-y-1">
                <NavItem icon={<ListTree className="w-5 h-5" />} label="Project Board" href="/" />
                <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Schedule" href="/schedule" />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 space-y-2">
                <ExportButton />
                <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
                <div className="flex items-center gap-3 pt-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                        <User className="w-4 h-4 text-zinc-400" />
                    </div>
                    <div className="hidden lg:block">
                        <div className="text-sm font-medium">Yoshi</div>
                        <div className="text-xs text-zinc-500">Free Plan</div>
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
