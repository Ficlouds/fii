ALTER TABLE "user_memory_persona_document_histories" ADD COLUMN IF NOT EXISTS "snapshot_editor_data" jsonb;--> statement-breakpoint
ALTER TABLE "user_memory_persona_documents" ADD COLUMN IF NOT EXISTS "editor_data" jsonb;
