import { pgTable, serial, text, timestamp, integer, uuid, pgEnum, jsonb, boolean } from 'drizzle-orm/pg-core';
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
    title: text('title'), // Optional title for the block itself (e.g., "Shinkansen Travel")
    startAt: timestamp('start_at').notNull(),
    endAt: timestamp('end_at').notNull(),
    type: timeBlockTypeEnum('type').notNull(), // 'plan' or 'actual'
    notes: text('notes'),
});

// Join Table for Many-to-Many: Tasks <-> Time Blocks
export const taskToTimeBlocks = pgTable('task_to_time_blocks', {
    id: serial('id').primaryKey(),
    taskId: uuid('task_id').notNull().references(() => tasks.id),
    timeBlockId: uuid('time_block_id').notNull().references(() => timeBlocks.id),
});

export const comments = pgTable('comments', {
    id: uuid('id').defaultRandom().primaryKey(),
    taskId: uuid('task_id').references(() => tasks.id),
    timeBlockId: uuid('time_block_id').references(() => timeBlocks.id),
    senderId: text('sender_id').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    type: text('type', { enum: ['mention', 'assignment', 'comment'] }).notNull(),
    content: text('content').notNull(),
    sourceId: text('source_id'), // ID of the referenced object
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Task Relations
export const taskRelations = relations(tasks, ({ many, one }) => ({
    parent: one(tasks, {
        fields: [tasks.parentId],
        references: [tasks.id],
        relationName: 'hierarchy',
    }),
    children: many(tasks, { relationName: 'hierarchy' }),
    dependencies: many(taskDependencies, { relationName: 'task_dependencies' }),
    dependents: many(taskDependencies, { relationName: 'task_dependents' }),
    // New: Link to join table
    taskToTimeBlocks: many(taskToTimeBlocks),
    comments: many(comments),
}));

export const timeBlockRelations = relations(timeBlocks, ({ many }) => ({
    // New: Link to join table
    taskToTimeBlocks: many(taskToTimeBlocks),
    comments: many(comments),
}));

export const commentRelations = relations(comments, ({ one }) => ({
    task: one(tasks, {
        fields: [comments.taskId],
        references: [tasks.id],
    }),
    timeBlock: one(timeBlocks, {
        fields: [comments.timeBlockId],
        references: [timeBlocks.id],
    }),
}));

export const taskToTimeBlocksRelations = relations(taskToTimeBlocks, ({ one }) => ({
    task: one(tasks, {
        fields: [taskToTimeBlocks.taskId],
        references: [tasks.id],
    }),
    timeBlock: one(timeBlocks, {
        fields: [taskToTimeBlocks.timeBlockId],
        references: [timeBlocks.id],
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
        relationName: 'task_dependents',
    }),
    successor: one(tasks, {
        fields: [taskDependencies.successorId],
        references: [tasks.id],
        relationName: 'task_dependencies',
    }),
}));
