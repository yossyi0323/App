CREATE TYPE "public"."data_type" AS ENUM('STRING', 'NUMBER', 'DATE', 'SELECT');--> statement-breakpoint
CREATE TABLE "item_metas" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"data_type" "data_type" NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"options" jsonb,
	CONSTRAINT "item_metas_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "item_values" (
	"id" text PRIMARY KEY NOT NULL,
	"item_id" text NOT NULL,
	"meta_id" text NOT NULL,
	"value_string" text,
	"value_number" double precision,
	"value_date" timestamp,
	CONSTRAINT "item_values_item_id_meta_id_unique" UNIQUE("item_id","meta_id")
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policies" (
	"id" text PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"action" text NOT NULL,
	"subject" text NOT NULL,
	"conditions" jsonb
);
--> statement-breakpoint
ALTER TABLE "item_values" ADD CONSTRAINT "item_values_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_values" ADD CONSTRAINT "item_values_meta_id_item_metas_id_fk" FOREIGN KEY ("meta_id") REFERENCES "public"."item_metas"("id") ON DELETE cascade ON UPDATE no action;