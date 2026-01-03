import { getTasks } from '@/actions/tasks';
import { AppSidebar } from '@/components/app-sidebar';
import { DashboardContainer } from '@/components/dashboard-container';

export default async function Home() {
  const tasks = await getTasks();

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      <AppSidebar />
      <div className="flex-1 flex flex-col h-full min-w-0">
        <DashboardContainer initialTasks={tasks as any} />
      </div>
    </div>
  );
}
