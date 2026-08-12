CREATE TABLE `upload` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`workspace_id` text,
	`key` text(1024) NOT NULL,
	`filename` text(255) NOT NULL,
	`content_type` text(255) NOT NULL,
	`size_bytes` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `upload_user_idx` ON `upload` (`user_id`);--> statement-breakpoint
CREATE INDEX `upload_workspace_idx` ON `upload` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `upload_created_idx` ON `upload` (`created_at`);