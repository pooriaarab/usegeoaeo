DROP INDEX `workspace_member_pair_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `workspace_member_pair_unique` ON `workspace_member` (`workspace_id`,`user_id`);