import { getTaskById, getTasks } from "@/actions/tasks";
import { TaskEditor } from "@/components/task-editor";
import { notFound } from "next/navigation";

export default async function TaskPage({ params }: { params: { id: string } }) {
    const [task, allTasks] = await Promise.all([
        getTaskById(params.id),
        getTasks()
    ]);

    if (!task) {
        notFound();
    }

    return (
        <div className="h-screen bg-zinc-950">
            <TaskEditor task={task} allTasks={allTasks} />
        </div>
    );
}
