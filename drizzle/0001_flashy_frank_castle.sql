ALTER TABLE "ticket" ADD COLUMN "validation_requested_at" timestamp;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "closed_by" text;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "closed_at" timestamp;--> statement-breakpoint
ALTER TABLE "ticket" ADD COLUMN "closed_by_user_id" text;--> statement-breakpoint
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_closed_by_user_id_user_id_fk" FOREIGN KEY ("closed_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;