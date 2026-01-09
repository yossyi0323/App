import { pgTable, text, timestamp, doublePrecision, boolean, unique, jsonb, pgEnum } from "drizzle-orm/pg-core";

// データ型定義
export const dataTypeEnum = pgEnum("data_type", ["STRING", "NUMBER", "DATE", "SELECT"]);

// エンティティ：全ての「モノ」の核
export const items = pgTable("items", {
    id: text("id").primaryKey(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// メタデータ：ユーザーが定義する項目の設計図
export const itemMetas = pgTable("item_metas", {
    id: text("id").primaryKey(),
    key: text("key").unique().notNull(), // プログラマブルなキー名 (e.g., "price")
    label: text("label").notNull(),      // 表示名 (e.g., "販売価格")
    dataType: dataTypeEnum("data_type").notNull(),
    isRequired: boolean("is_required").default(false).notNull(),
    options: jsonb("options"),           // SELECT型の場合の選択肢 [{label: "A", value: "a"}]
});

// 値の保存：正規化された実データ
export const itemValues = pgTable("item_values", {
    id: text("id").primaryKey(),
    itemId: text("item_id").references(() => items.id, { onDelete: 'cascade' }).notNull(),
    metaId: text("meta_id").references(() => itemMetas.id, { onDelete: 'cascade' }).notNull(),

    // 型別にカラムを分ける。性能と型安全を両立。
    valueString: text("value_string"),
    valueNumber: doublePrecision("value_number"),
    valueDate: timestamp("value_date"),
}, (t) => ({
    unq: unique().on(t.itemId, t.metaId), // 1アイテムに対し1項目の値は1つのみ
}));

// 認可ポリシー：誰が何に対して何ができるか
export const policies = pgTable("policies", {
    id: text("id").primaryKey(),
    role: text("role").notNull(),     // e.g., "ADMIN", "EDITOR"
    action: text("action").notNull(), // e.g., "manage", "read", "update"
    subject: text("subject").notNull(), // e.g., "Item", "ItemMeta"
    conditions: jsonb("conditions"),  // CASL形式の動的条件
});
