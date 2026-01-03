
import { getTasks } from '@/actions/tasks';
import { AppSidebar } from '@/components/app-sidebar';
import { GanttChart } from '@/components/gantt-chart';

export default async function GanttPage() {
    const tasks = await getTasks();

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
            <AppSidebar />
            <div className="flex-1 flex flex-col h-full min-w-0">
                <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500">Workspace</span>
                        <span className="text-zinc-700">/</span>
                        <span className="font-medium">Timeline (Gantt)</span>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                    <GanttChart tasks={tasks as any} />
                </div>
            </div>
        </div>
    );
}
