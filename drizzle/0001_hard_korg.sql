CREATE TABLE "distribution_outcomes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"queue_item_id" text NOT NULL,
	"executed_at" timestamp NOT NULL,
	"observed_at" timestamp NOT NULL,
	"notes" text,
	"metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "distribution_queue_items" ADD COLUMN "expected_outcome" text;--> statement-breakpoint
ALTER TABLE "distribution_outcomes" ADD CONSTRAINT "distribution_outcomes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_outcomes" ADD CONSTRAINT "distribution_outcomes_queue_item_id_distribution_queue_items_id_fk" FOREIGN KEY ("queue_item_id") REFERENCES "public"."distribution_queue_items"("id") ON DELETE cascade ON UPDATE no action;