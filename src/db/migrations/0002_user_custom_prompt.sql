ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "custom_prompt" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "custom_preset" text DEFAULT 'balanced';
