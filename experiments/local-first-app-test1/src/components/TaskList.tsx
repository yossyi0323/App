import React, { useState, useEffect, useRef } from "react";
import { useLiveQuery } from "@electric-sql/pglite-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Wifi } from "lucide-react";
import { db } from "@/lib/db";

interface Task {
    id: string;
    title: string;
    completed: boolean;
    created_at: string;
}

export function TaskList() {
    const tasks = useLiveQuery<Task>("SELECT * FROM tasks ORDER BY created_at DESC;");
    const [newTask, setNewTask] = useState("");
    const [isSyncing, setIsSyncing] = useState(false);
    const initialized = useRef(false);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        const sync = async () => {
            if (initialized.current) return;
            initialized.current = true;

            try {
                setIsSyncing(true);

                // Sync tasks table
                // Use absolute URL pointing to current origin to satisfy URL constructor
                // but still go through Vite proxy
                const syncUrl = `${window.location.origin}/v1/shape?table=tasks`;
                console.log("Starting sync with URL:", syncUrl);

                const shape = await (db.electric as any).syncShapeToTable({
                    shape: {
                        url: syncUrl,
                        signal: signal,
                    },
                    table: "tasks",
                    primaryKey: ["id"],
                });

                await shape.synced;
                console.log("Tasks synced");
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    console.error("Sync failed", err);
                }
            } finally {
                setIsSyncing(false);
            }
        };
        sync();

        return () => {
            controller.abort();
        };
    }, []);

    const addTask = async () => {
        if (!newTask.trim()) return;

        try {
            // Optimistic update (write to local DB immediately)
            const id = crypto.randomUUID();
            await db.query("INSERT INTO tasks (id, title) VALUES ($1, $2)", [id, newTask]);
            setNewTask("");

            // Upstream sync (write to PostgREST)
            // Use window.location.hostname to support remote access if needed, or hardcode localhost
            const apiHost = window.location.hostname;
            const response = await fetch(`http://${apiHost}:3001/tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Prefer": "return=representation", // Ask PostgREST to return the created record
                },
                body: JSON.stringify({
                    id: id,
                    title: newTask,
                    completed: false
                }),
            });

            if (!response.ok) {
                console.error("Failed to sync task upstream:", await response.text());
                // Handle rollback or retry queue here in a real app
            }
        } catch (err) {
            console.error("Error adding task:", err);
        }
    };

    const toggleTask = async (id: string, completed: boolean) => {
        try {
            // Optimistic update
            await db.query("UPDATE tasks SET completed = $1 WHERE id = $2", [
                !completed,
                id,
            ]);

            // Upstream sync
            const apiHost = window.location.hostname;
            const response = await fetch(`http://${apiHost}:3001/tasks?id=eq.${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    completed: !completed,
                }),
            });

            if (!response.ok) {
                console.error("Failed to sync toggle upstream:", await response.text());
            }
        } catch (err) {
            console.error("Error toggling task:", err);
        }
    };

    const deleteTask = async (id: string) => {
        try {
            // Optimistic update
            await db.query("DELETE FROM tasks WHERE id = $1", [id]);

            // Upstream sync
            const apiHost = window.location.hostname;
            const response = await fetch(`http://${apiHost}:3001/tasks?id=eq.${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                console.error("Failed to sync delete upstream:", await response.text());
            }
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto mt-10">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Local-First Tasks</CardTitle>
                <div className="flex items-center gap-2">
                    {isSyncing ? <RefreshCw className="animate-spin w-4 h-4" /> : <Wifi className="w-4 h-4 text-green-500" />}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex space-x-2">
                    <Input
                        value={newTask}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value)}
                        placeholder="Add a new task..."
                        onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && addTask()}
                    />
                    <Button onClick={addTask}>Add</Button>
                </div>

                <div className="space-y-2">
                    {tasks?.rows?.map((task: Task) => (
                        <div
                            key={task.id}
                            className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <Checkbox
                                checked={task.completed}
                                onCheckedChange={() => toggleTask(task.id, task.completed)}
                            />
                            <span
                                className={`flex-1 ${task.completed ? "line-through text-gray-500" : ""
                                    }`}
                            >
                                {task.title}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTask(task.id)}
                                className="text-red-500 hover:text-red-700"
                            >
                                Delete
                            </Button>
                        </div>
                    ))}
                    {tasks?.rows?.length === 0 && (
                        <p className="text-center text-gray-500">No tasks yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
