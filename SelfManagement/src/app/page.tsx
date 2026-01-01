import { getTasks, createTask } from '@/actions/tasks';
import { Button } from '@/components/ui/button';
import { TaskTree } from '@/components/task-tree';
import { GanttChart } from '@/components/gantt-chart';
import { AppSidebar } from '@/components/app-sidebar';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Separator } from '@/components/ui/separator';

export default async function Home() {
  const tasks = await getTasks();

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <AppSidebar />

      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500">Workspace</span>
            <span className="text-zinc-700">/</span>
            <span className="font-medium">Project Alpha</span>
          </div>

          <div className="flex items-center gap-3">
            <form action={createTask} className="flex gap-2">
              <input
                type="text"
                name="title"
                placeholder="Quick Add Task..."
                className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:border-zinc-700"
              />
            </form>
          </div>
        </header>

        {/* Main Content Area (Split View) */}
        <div className="flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal">
            {/* Left Pane: WBS (Tree Table) */}
            <ResizablePanel defaultSize={40} minSize={20} className="bg-zinc-950/50 flex flex-col">
              <div className="p-3 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/20">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Work Breakdown Structure</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <TaskTree tasks={tasks as any} />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Pane: Gantt */}
            <ResizablePanel defaultSize={60} minSize={30} className="bg-zinc-900/10 flex flex-col">
              <div className="p-3 border-b border-zinc-800/50 bg-zinc-900/20">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Timeline & Dependencies</h2>
              </div>
              <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                <GanttChart tasks={tasks as any} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  );
}
