CREATE TABLE "campus_location" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_subcategory" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_area" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "subcategory_id" integer;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "campus_id" integer;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "area_id" integer;--> statement-breakpoint
ALTER TABLE "ticket_subcategory" ADD CONSTRAINT "ticket_subcategory_category_id_ticket_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."ticket_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_category_id_ticket_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."ticket_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_subcategory_id_ticket_subcategory_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."ticket_subcategory"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_campus_id_campus_location_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campus_location"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_area_id_work_area_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."work_area"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket" DROP COLUMN "subcategory";--> statement-breakpoint
ALTER TABLE "ticket" DROP COLUMN "area";--> statement-breakpoint
ALTER TABLE "ticket" DROP COLUMN "campus";