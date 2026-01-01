import { Task } from '@/db/schema'; // Assuming type infer

export function generateMarkdown(tasks: any[]): string {
    const buildTree = (taskList: any[]) => {
        const taskMap = new Map();
        const roots: any[] = [];
        taskList.forEach(t => taskMap.set(t.id, { ...t, children: [] }));
        taskList.forEach(t => {
            const task = taskMap.get(t.id);
            if (t.parentId && taskMap.has(t.parentId)) {
                taskMap.get(t.parentId).children.push(task);
            } else {
                roots.push(task);
            }
        });
        return roots;
    };

    const tree = buildTree(tasks);
    let output = "# Project Tasks\n\n";

    const renderNode = (node: any, level: number) => {
        const indent = "    ".repeat(level); // 4 spaces
        const statusMark = node.status === 'done' ? '[x]' : '[ ]';
        output += `${indent}- ${statusMark} ${node.title}`;

        // Add meta (e.g. [[Link]], #tag) if needed
        if (node.status !== 'done' && node.status !== 'planned') {
            output += ` #status/${node.status}`;
        }
        output += "\n";

        // Description nested
        if (node.description) {
            output += `${indent}  > ${node.description.replace(/\n/g, `\n${indent}  > `)}\n`;
        }

        if (node.children) {
            node.children.forEach((child: any) => renderNode(child, level + 1));
        }
    };

    tree.forEach(root => renderNode(root, 0));
    return output;
}
