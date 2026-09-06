CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"issuer" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_account_id_issuer_unique" UNIQUE("account_id","issuer")
);
--> statement-breakpoint
CREATE TABLE "audiences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"problems" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"platform_affinity" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_ideas" (
	"id" text PRIMARY KEY NOT NULL,
	"content_intelligence_id" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"angle" text NOT NULL,
	"source_context" text NOT NULL,
	"importance" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_intelligence" (
	"id" text PRIMARY KEY NOT NULL,
	"content_source_id" text NOT NULL,
	"summary" text NOT NULL,
	"core_thesis" text,
	"topics" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"technical_concepts" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"opinions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"lessons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"examples" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"audiences" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "content_intelligence_content_source_id_unique" UNIQUE("content_source_id")
);
--> statement-breakpoint
CREATE TABLE "content_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"type" text NOT NULL,
	"raw_content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "distribution_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"strategy_id" text NOT NULL,
	"user_id" text NOT NULL,
	"format_id" text NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"metadata" jsonb,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "distribution_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content_source_id" text NOT NULL,
	"primary_goal_id" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "distribution_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expertise" jsonb,
	"topics" jsonb,
	"preferred_platforms" jsonb,
	"primary_goal" text,
	"secondary_goals" jsonb,
	"voice_preferences" jsonb,
	"promotion_tolerance" text,
	"content_preferences" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "distribution_queue_items" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"strategy_id" text NOT NULL,
	"asset_id" text,
	"scheduled_at" timestamp NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "distribution_strategies" (
	"id" text PRIMARY KEY NOT NULL,
	"plan_id" text NOT NULL,
	"content_idea_id" text NOT NULL,
	"platform_id" text NOT NULL,
	"audience_id" text NOT NULL,
	"goal_id" text NOT NULL,
	"format_id" text NOT NULL,
	"action_id" text NOT NULL,
	"rank" integer NOT NULL,
	"score" integer NOT NULL,
	"rationale" text NOT NULL,
	"angle" text NOT NULL,
	"status" text NOT NULL,
	"origin" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audiences" ADD CONSTRAINT "audiences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_ideas" ADD CONSTRAINT "content_ideas_content_intelligence_id_content_intelligence_id_fk" FOREIGN KEY ("content_intelligence_id") REFERENCES "public"."content_intelligence"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_intelligence" ADD CONSTRAINT "content_intelligence_content_source_id_content_sources_id_fk" FOREIGN KEY ("content_source_id") REFERENCES "public"."content_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_sources" ADD CONSTRAINT "content_sources_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_assets" ADD CONSTRAINT "distribution_assets_strategy_id_distribution_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."distribution_strategies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_assets" ADD CONSTRAINT "distribution_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_plans" ADD CONSTRAINT "distribution_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_plans" ADD CONSTRAINT "distribution_plans_content_source_id_content_sources_id_fk" FOREIGN KEY ("content_source_id") REFERENCES "public"."content_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_profiles" ADD CONSTRAINT "distribution_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_queue_items" ADD CONSTRAINT "distribution_queue_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_queue_items" ADD CONSTRAINT "distribution_queue_items_strategy_id_distribution_strategies_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."distribution_strategies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_queue_items" ADD CONSTRAINT "distribution_queue_items_asset_id_distribution_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."distribution_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_strategies" ADD CONSTRAINT "distribution_strategies_plan_id_distribution_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."distribution_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_strategies" ADD CONSTRAINT "distribution_strategies_content_idea_id_content_ideas_id_fk" FOREIGN KEY ("content_idea_id") REFERENCES "public"."content_ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "distribution_strategies" ADD CONSTRAINT "distribution_strategies_audience_id_audiences_id_fk" FOREIGN KEY ("audience_id") REFERENCES "public"."audiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;