ALTER TABLE "agent_documents" ADD COLUMN IF NOT EXISTS "parent_id" uuid;--> statement-breakpoint
ALTER TABLE "agent_documents" ADD COLUMN IF NOT EXISTS "filename" text;--> statement-breakpoint
ALTER TABLE "agent_documents" DROP CONSTRAINT IF EXISTS "agent_documents_parent_id_agent_documents_id_fk";--> statement-breakpoint
ALTER TABLE "agent_documents" ADD CONSTRAINT "agent_documents_parent_id_agent_documents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."agent_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "agent_documents_parent_id_idx" ON "agent_documents" USING btree ("parent_id");
