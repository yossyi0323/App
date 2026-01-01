import { pgTable, uuid, varchar, text, boolean, timestamp, integer, date, pgEnum, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Enums
export const productTypeEnum = pgEnum('product_type', ['raw_material', 'intermediate', 'final_dish', 'seasoning', 'other']);
export const inputTypeEnum = pgEnum('input_type', ['PRODUCT', 'TEXT_INPUT']);
export const stockStatusEnum = pgEnum('stock_status', ['AVAILABLE', 'NEED_REFILL', 'NO_REFILL']);

// 1. USERS（ユーザー）
export const users = pgTable('users', {
  userId: uuid('user_id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  pictureUrl: varchar('picture_url', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedCount: integer('updated_count').notNull().default(0),
}, (table) => ({
  emailIdx: index('idx_users_email').on(table.email),
}));

// 2. PRODUCTS（製品カタログ）
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: productTypeEnum('type').notNull(),
  isStockable: boolean('is_stockable').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedCount: integer('updated_count').notNull().default(0),
}, (table) => ({
  nameIdx: index('idx_products_name').on(table.name),
  typeIdx: index('idx_products_type').on(table.type),
  isStockableIdx: index('idx_products_is_stockable').on(table.isStockable),
}));

// 3. RECIPES（レシピ）
export const recipes = pgTable('recipes', {
  recipeId: uuid('recipe_id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  parentRecipeId: uuid('parent_recipe_id').references(() => recipes.recipeId, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull(),
  recipeUrl: varchar('recipe_url', { length: 500 }),
  instructionsText: text('instructions_text').notNull(),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedCount: integer('updated_count').notNull().default(0),
}, (table) => ({
  userIdIdx: index('idx_recipes_user_id').on(table.userId),
  parentRecipeIdIdx: index('idx_recipes_parent_recipe_id').on(table.parentRecipeId),
  nameIdx: index('idx_recipes_name').on(table.name),
  deletedAtIdx: index('idx_recipes_deleted_at').on(table.deletedAt),
  userDeletedIdx: index('idx_recipes_user_deleted').on(table.userId, table.deletedAt),
}));

// 4. RECIPE_COMPONENTS（レシピの材料）
export const recipeComponents = pgTable('recipe_components', {
  componentId: uuid('component_id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id').notNull().references(() => recipes.recipeId, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  ingredientName: varchar('ingredient_name', { length: 255 }),
  inputType: inputTypeEnum('input_type').notNull(),
  quantityMemo: text('quantity_memo'),
  isOptional: boolean('is_optional').notNull().default(false),
  requiredStateTransitionId: uuid('required_state_transition_id'), // Phase 2以降
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedCount: integer('updated_count').notNull().default(0),
}, (table) => ({
  recipeIdIdx: index('idx_recipe_components_recipe_id').on(table.recipeId),
  productIdIdx: index('idx_recipe_components_product_id').on(table.productId),
}));

// 5. RECIPE_OUTPUTS（レシピのアウトプット）
export const recipeOutputs = pgTable('recipe_outputs', {
  outputId: uuid('output_id').primaryKey().defaultRandom(),
  recipeId: uuid('recipe_id').notNull().references(() => recipes.recipeId, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantityMemo: text('quantity_memo'),
  isMainOutput: boolean('is_main_output').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedCount: integer('updated_count').notNull().default(0),
}, (table) => ({
  recipeIdIdx: index('idx_recipe_outputs_recipe_id').on(table.recipeId),
  productIdIdx: index('idx_recipe_outputs_product_id').on(table.productId),
}));

// 6. STOCKS（ストック）
export const stocks = pgTable('stocks', {
  stockId: uuid('stock_id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.userId, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  productName: varchar('product_name', { length: 255 }).notNull(), // キャッシュ
  productType: productTypeEnum('product_type').notNull(), // キャッシュ
  status: stockStatusEnum('status').notNull().default('AVAILABLE'),
  quantityMemo: text('quantity_memo'),
  stateMemo: text('state_memo'), // Phase 1で使用
  stockedSinceDate: date('stocked_since_date').notNull().default(sql`CURRENT_DATE`),
  createdFromRecipeId: uuid('created_from_recipe_id').references(() => recipes.recipeId, { onDelete: 'set null' }),
  ingredientId: uuid('ingredient_id'), // Phase 2以降
  stateTransitionId: uuid('state_transition_id'), // Phase 2以降
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  updatedCount: integer('updated_count').notNull().default(0),
}, (table) => ({
  userIdIdx: index('idx_stocks_user_id').on(table.userId),
  productIdIdx: index('idx_stocks_product_id').on(table.productId),
  statusIdx: index('idx_stocks_status').on(table.status),
  stockedSinceDateIdx: index('idx_stocks_stocked_since_date').on(table.stockedSinceDate),
  createdFromRecipeIdIdx: index('idx_stocks_created_from_recipe_id').on(table.createdFromRecipeId),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  recipes: many(recipes),
  stocks: many(stocks),
}));

export const productsRelations = relations(products, ({ many }) => ({
  recipeComponents: many(recipeComponents),
  recipeOutputs: many(recipeOutputs),
  stocks: many(stocks),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  user: one(users, {
    fields: [recipes.userId],
    references: [users.userId],
  }),
  parentRecipe: one(recipes, {
    fields: [recipes.parentRecipeId],
    references: [recipes.recipeId],
    relationName: 'parent',
  }),
  childRecipes: many(recipes, {
    relationName: 'parent',
  }),
  components: many(recipeComponents),
  outputs: many(recipeOutputs),
  createdStocks: many(stocks),
}));

export const recipeComponentsRelations = relations(recipeComponents, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeComponents.recipeId],
    references: [recipes.recipeId],
  }),
  product: one(products, {
    fields: [recipeComponents.productId],
    references: [products.id],
  }),
}));

export const recipeOutputsRelations = relations(recipeOutputs, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeOutputs.recipeId],
    references: [recipes.recipeId],
  }),
  product: one(products, {
    fields: [recipeOutputs.productId],
    references: [products.id],
  }),
}));

export const stocksRelations = relations(stocks, ({ one }) => ({
  user: one(users, {
    fields: [stocks.userId],
    references: [users.userId],
  }),
  product: one(products, {
    fields: [stocks.productId],
    references: [products.id],
  }),
  createdFromRecipe: one(recipes, {
    fields: [stocks.createdFromRecipeId],
    references: [recipes.recipeId],
  }),
}));
