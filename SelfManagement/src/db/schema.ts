import { pgTable, serial, text, timestamp, integer, uuid, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const statusEnum = pgEnum('status', ['planned', 'doing', 'waiting', 'reviewing', 'done']);
export const categoryEnum = pgEnum('category', ['core', 'work', 'life', 'relationships', 'hobby']);

// Tasks Table
export const tasks = pgTable('tasks', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description'), // Markdown content

    // Task Properties
    objective: text('objective'), // "What" and "Why"
    outputDefinition: text('output_definition'), // Completion criteria
    assignee: text('assignee'), // "Who holds the ball"

    // Categorization
    category: categoryEnum('category'),

    // Scheduling
    startAt: timestamp('start_at'),
    endAt: timestamp('end_at'),

    // Status
    status: statusEnum('status').default('planned').notNull(),

    // Hierarchy (Adjacency List)
    parentId: uuid('parent_id'),

    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),

    // Flexible Properties
    customProperties: jsonb('custom_properties'),
});

// Time Blocks for Vertical Scheduler (Plan vs Actual)
export const timeBlockTypeEnum = pgEnum('time_block_type', ['plan', 'actual']);

export const timeBlocks = pgTable('time_blocks', {
    id: uuid('id').defaultRandom().primaryKey(),
    taskId: uuid('task_id').references(() => tasks.id),
    startAt: timestamp('start_at').notNull(),
    endAt: timestamp('end_at').notNull(),
    type: timeBlockTypeEnum('type').notNull(), // 'plan' or 'actual'
    notes: text('notes'),
});

// Task Relations
export const tasksRelations = relations(tasks, ({ one, many }) => ({
    parent: one(tasks, {
        fields: [tasks.parentId],
        references: [tasks.id],
        relationName: 'parent_child',
    }),
    children: many(tasks, {
        relationName: 'parent_child',
    }),
    // For dependencies (adjacency list for graph edges)
    dependencies: many(taskDependencies, { relationName: 'predecessors' }),
    dependents: many(taskDependencies, { relationName: 'successors' }),
    // Time Blocks
    timeBlocks: many(timeBlocks),
}));

export const timeBlocksRelations = relations(timeBlocks, ({ one }) => ({
    task: one(tasks, {
        fields: [timeBlocks.taskId],
        references: [tasks.id],
    }),
}));

// Dependencies Join Table (Many-to-Many for Predecessor -> Successor)
export const taskDependencies = pgTable('task_dependencies', {
    id: serial('id').primaryKey(),
    predecessorId: uuid('predecessor_id').notNull().references(() => tasks.id),
    successorId: uuid('successor_id').notNull().references(() => tasks.id),
});

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
    predecessor: one(tasks, {
        fields: [taskDependencies.predecessorId],
        references: [tasks.id],
        relationName: 'successors', // Creates link from predecessor to this dependency
    }),
    successor: one(tasks, {
        fields: [taskDependencies.successorId],
        references: [tasks.id],
        relationName: 'predecessors', // Creates link from successor to this dependency
    }),
}));
