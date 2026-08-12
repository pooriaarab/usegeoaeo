CREATE TABLE `agent_integration` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`provider` text(50) NOT NULL,
	`display_name` text(120) NOT NULL,
	`status` text NOT NULL,
	`credentials_ref` text NOT NULL,
	`scopes_json` text DEFAULT '[]' NOT NULL,
	`enabled_tools_json` text DEFAULT '[]' NOT NULL,
	`connected_at` integer,
	`disconnected_at` integer,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `agent_integration_workspace_idx` ON `agent_integration` (`workspace_id`);--> statement-breakpoint
CREATE TABLE `agent_memory` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`key` text(200) NOT NULL,
	`value_json` text NOT NULL,
	`embedding_json` text,
	`expires_at` integer,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`agent_id`) REFERENCES `agent`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `agent_memory_workspace_idx` ON `agent_memory` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `agent_memory_agent_idx` ON `agent_memory` (`agent_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `agent_memory_agent_key_unique` ON `agent_memory` (`agent_id`,`key`);--> statement-breakpoint
CREATE TABLE `agent` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text(120) NOT NULL,
	`description` text(2000) DEFAULT '' NOT NULL,
	`model` text(120) NOT NULL,
	`system_prompt` text DEFAULT '' NOT NULL,
	`is_default_ai_chat` integer DEFAULT false NOT NULL,
	`tool_allowlist_json` text DEFAULT '[]' NOT NULL,
	`public_key` text,
	`public_enabled` integer DEFAULT false NOT NULL,
	`last_used_at` integer,
	`archived_at` integer,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `agent_workspace_idx` ON `agent` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `agent_public_key_idx` ON `agent` (`public_key`);--> statement-breakpoint
CREATE TABLE `api_key` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text(120) NOT NULL,
	`key_hash` text NOT NULL,
	`prefix` text(16) NOT NULL,
	`created_by_user_id` text,
	`last_used_at` integer,
	`revoked_at` integer,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `api_key_workspace_idx` ON `api_key` (`workspace_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `api_key_hash_unique` ON `api_key` (`key_hash`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`actor_user_id` text,
	`action` text(120) NOT NULL,
	`target_type` text(80),
	`target_id` text,
	`meta_json` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `audit_workspace_idx` ON `audit_log` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `audit_actor_idx` ON `audit_log` (`actor_user_id`);--> statement-breakpoint
CREATE TABLE `billing_event` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text(120) NOT NULL,
	`payload_json` text DEFAULT '{}' NOT NULL,
	`received_at` integer NOT NULL,
	`applied_at` integer,
	`attempts` integer DEFAULT 0 NOT NULL,
	`error` text
);
--> statement-breakpoint
CREATE INDEX `billing_event_type_idx` ON `billing_event` (`type`);--> statement-breakpoint
CREATE TABLE `billing` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`workspace_id` text PRIMARY KEY NOT NULL,
	`plan` text DEFAULT 'free' NOT NULL,
	`status` text(40) DEFAULT 'active' NOT NULL,
	`customer_id` text,
	`subscription_id` text,
	`current_period_end` integer,
	`cancel_at_period_end` integer DEFAULT false NOT NULL,
	`entitlements_json` text DEFAULT '{"aiTokensPerMonth":0,"members":1}' NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `billing_customer_idx` ON `billing` (`customer_id`);--> statement-breakpoint
CREATE TABLE `item` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`type` text(80) NOT NULL,
	`title` text(255) DEFAULT '' NOT NULL,
	`data_json` text DEFAULT '{}' NOT NULL,
	`created_by_user_id` text,
	`archived_at` integer,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `item_workspace_idx` ON `item` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `item_type_idx` ON `item` (`type`);--> statement-breakpoint
CREATE TABLE `message` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`tool_name` text,
	`tool_call_id` text,
	`usage_input_tokens` integer,
	`usage_output_tokens` integer,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	FOREIGN KEY (`thread_id`) REFERENCES `thread`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`agent_id`) REFERENCES `agent`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `message_thread_idx` ON `message` (`thread_id`);--> statement-breakpoint
CREATE INDEX `message_workspace_idx` ON `message` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `message_created_idx` ON `message` (`created_at`);--> statement-breakpoint
CREATE TABLE `outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text(80) NOT NULL,
	`payload_json` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` integer NOT NULL,
	`sent_at` integer
);
--> statement-breakpoint
CREATE INDEX `outbox_status_idx` ON `outbox` (`status`);--> statement-breakpoint
CREATE INDEX `outbox_created_idx` ON `outbox` (`created_at`);--> statement-breakpoint
CREATE TABLE `setting` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`key` text(120) NOT NULL,
	`value_json` text NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `setting_workspace_key_unique` ON `setting` (`workspace_id`,`key`);--> statement-breakpoint
CREATE TABLE `agent_skill` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`name` text(120) NOT NULL,
	`description` text(2000) DEFAULT '' NOT NULL,
	`body` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`agent_id`) REFERENCES `agent`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `skill_workspace_idx` ON `agent_skill` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `skill_agent_idx` ON `agent_skill` (`agent_id`);--> statement-breakpoint
CREATE TABLE `thread` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`actor` text NOT NULL,
	`actor_id` text NOT NULL,
	`visibility` text DEFAULT 'internal' NOT NULL,
	`title` text(200) DEFAULT '' NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`message_count` integer DEFAULT 0 NOT NULL,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`last_message_at` integer,
	`archived_at` integer,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`agent_id`) REFERENCES `agent`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `thread_workspace_idx` ON `thread` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `thread_agent_idx` ON `thread` (`agent_id`);--> statement-breakpoint
CREATE INDEX `thread_actor_idx` ON `thread` (`actor_id`);--> statement-breakpoint
CREATE TABLE `tool` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`name` text(120) NOT NULL,
	`description` text(2000) DEFAULT '' NOT NULL,
	`input_schema_json` text DEFAULT '{}' NOT NULL,
	`kind` text NOT NULL,
	`integration_id` text,
	`enabled` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tool_workspace_idx` ON `tool` (`workspace_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `tool_workspace_name_unique` ON `tool` (`workspace_id`,`name`);--> statement-breakpoint
CREATE TABLE `visitor_session` (
	`id` text PRIMARY KEY NOT NULL,
	`agent_id` text NOT NULL,
	`workspace_id` text NOT NULL,
	`ip` text DEFAULT '' NOT NULL,
	`user_agent` text DEFAULT '' NOT NULL,
	`country` text DEFAULT '' NOT NULL,
	`first_seen_at` integer NOT NULL,
	`last_seen_at` integer NOT NULL,
	`message_count` integer DEFAULT 0 NOT NULL,
	`token_usage` integer DEFAULT 0 NOT NULL,
	`captcha_passed_at` integer,
	FOREIGN KEY (`agent_id`) REFERENCES `agent`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `visitor_session_agent_idx` ON `visitor_session` (`agent_id`);--> statement-breakpoint
CREATE INDEX `visitor_session_workspace_idx` ON `visitor_session` (`workspace_id`);--> statement-breakpoint
CREATE TABLE `webhook` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`url` text(2048) NOT NULL,
	`secret_hash` text NOT NULL,
	`events_json` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`last_delivered_at` integer,
	`last_failure_at` integer,
	`failure_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`agent_id`) REFERENCES `agent`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `webhook_workspace_idx` ON `webhook` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `webhook_agent_idx` ON `webhook` (`agent_id`);--> statement-breakpoint
ALTER TABLE `workspace_member` ADD `status` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `workspace_member` ADD `invited_by` text;--> statement-breakpoint
ALTER TABLE `workspace_member` ADD `email` text;--> statement-breakpoint
ALTER TABLE `workspace_member` ADD `joined_at` integer;--> statement-breakpoint
ALTER TABLE `workspace` ADD `owner_id` text REFERENCES user(id);--> statement-breakpoint
ALTER TABLE `workspace` ADD `onboarding_complete_at` integer;--> statement-breakpoint
ALTER TABLE `workspace` ADD `onboarding_steps_json` text DEFAULT '{}' NOT NULL;