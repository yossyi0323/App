CREATE TYPE "public"."input_type" AS ENUM('PRODUCT', 'TEXT_INPUT');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('raw_material', 'intermediate', 'final_dish', 'seasoning', 'other');--> statement-breakpoint
CREATE TYPE "public"."stock_status" AS ENUM('AVAILABLE', 'NEED_REFILL', 'NO_REFILL');--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "product_type" NOT NULL,
	"is_stockable" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_components" (
	"component_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"product_id" uuid,
	"ingredient_name" varchar(255),
	"input_type" "input_type" NOT NULL,
	"quantity_memo" text,
	"is_optional" boolean DEFAULT false NOT NULL,
	"required_state_transition_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_outputs" (
	"output_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity_memo" text,
	"is_main_output" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"recipe_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"parent_recipe_id" uuid,
	"name" varchar(255) NOT NULL,
	"recipe_url" varchar(500),
	"instructions_text" text NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stocks" (
	"stock_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"product_type" "product_type" NOT NULL,
	"status" "stock_status" DEFAULT 'AVAILABLE' NOT NULL,
	"quantity_memo" text,
	"state_memo" text,
	"stocked_since_date" date DEFAULT CURRENT_DATE NOT NULL,
	"created_from_recipe_id" uuid,
	"ingredient_id" uuid,
	"state_transition_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"picture_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "recipe_components" ADD CONSTRAINT "recipe_components_recipe_id_recipes_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("recipe_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_components" ADD CONSTRAINT "recipe_components_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_outputs" ADD CONSTRAINT "recipe_outputs_recipe_id_recipes_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("recipe_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_outputs" ADD CONSTRAINT "recipe_outputs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_parent_recipe_id_recipes_recipe_id_fk" FOREIGN KEY ("parent_recipe_id") REFERENCES "public"."recipes"("recipe_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_created_from_recipe_id_recipes_recipe_id_fk" FOREIGN KEY ("created_from_recipe_id") REFERENCES "public"."recipes"("recipe_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_products_name" ON "products" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_products_type" ON "products" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_products_is_stockable" ON "products" USING btree ("is_stockable");--> statement-breakpoint
CREATE INDEX "idx_recipe_components_recipe_id" ON "recipe_components" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "idx_recipe_components_product_id" ON "recipe_components" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_recipe_outputs_recipe_id" ON "recipe_outputs" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "idx_recipe_outputs_product_id" ON "recipe_outputs" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_recipes_user_id" ON "recipes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_recipes_parent_recipe_id" ON "recipes" USING btree ("parent_recipe_id");--> statement-breakpoint
CREATE INDEX "idx_recipes_name" ON "recipes" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_recipes_deleted_at" ON "recipes" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "idx_recipes_user_deleted" ON "recipes" USING btree ("user_id","deleted_at");--> statement-breakpoint
CREATE INDEX "idx_stocks_user_id" ON "stocks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_stocks_product_id" ON "stocks" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_stocks_status" ON "stocks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_stocks_stocked_since_date" ON "stocks" USING btree ("stocked_since_date");--> statement-breakpoint
CREATE INDEX "idx_stocks_created_from_recipe_id" ON "stocks" USING btree ("created_from_recipe_id");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");