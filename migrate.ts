import { sql } from 'drizzle-orm';
import { db } from './src/lib/db';

async function migrate() {
    console.log("Applying queue table migration manually...");
    try {
        await db.execute(sql`
CREATE TABLE IF NOT EXISTS "distribution_queue_items" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"strategy_id" text NOT NULL,
	"asset_id" text,
	"scheduled_at" timestamp NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
        `);
        
        await db.execute(sql`
ALTER TABLE "distribution_queue_items" ADD CONSTRAINT "distribution_queue_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
        `);
        
        await db.execute(sql`
ALTER TABLE "distribution_queue_items" ADD CONSTRAINT "distribution_queue_items_strategy_id_distribution_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."distribution_strategies"("id") ON DELETE cascade ON UPDATE no action;
        `);
        
        await db.execute(sql`
ALTER TABLE "distribution_queue_items" ADD CONSTRAINT "distribution_queue_items_asset_id_distribution_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."distribution_assets"("id") ON DELETE set null ON UPDATE no action;
        `);
        
        console.log("Migration successful!");
    } catch (e) {
        console.error("Migration failed:", e);
    }
    process.exit(0);
}

migrate();
