"use server"

import { getTasks } from "./tasks";
import { generateMarkdown } from "@/lib/markdown-generator";

export async function exportTasks() {
    const tasks = await getTasks();
    return generateMarkdown(tasks);
}
