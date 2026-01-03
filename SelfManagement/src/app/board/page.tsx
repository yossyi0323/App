
import { getTasks } from '@/actions/tasks';
import { AppSidebar } from '@/components/app-sidebar';
import { TaskTree } from '@/components/task-tree';

export default async function BoardPage() {
    const tasks = await getTasks();

    return (
        <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
            <AppSidebar />
            <div className="flex-1 flex flex-col h-full min-w-0">
                <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500">Workspace</span>
                        <span className="text-zinc-700">/</span>
                        <span className="font-medium">Project Board (Tree)</span>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-5xl mx-auto">
                        <TaskTree tasks={tasks as any} />
                    </div>
                </div>
            </div>
        </div>
    );
}
