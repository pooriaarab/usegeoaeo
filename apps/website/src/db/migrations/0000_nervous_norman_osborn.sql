CREATE TABLE `user` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`name` text(255),
	`email` text(255),
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text(600),
	`is_anonymous` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE INDEX `user_email_idx` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `auth_account` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`providerId` text(50) NOT NULL,
	`accountId` text(255) NOT NULL,
	`accessToken` text(4000),
	`refreshToken` text(4000),
	`idToken` text(4000),
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text(1000),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `auth_account_user_idx` ON `auth_account` (`user_id`);--> statement-breakpoint
CREATE INDEX `auth_account_provider_idx` ON `auth_account` (`providerId`);--> statement-breakpoint
CREATE INDEX `auth_account_provider_account_idx` ON `auth_account` (`providerId`,`accountId`);--> statement-breakpoint
CREATE TABLE `auth_session` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`token` text(128) NOT NULL,
	`user_id` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`ipAddress` text(100),
	`userAgent` text(600),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `auth_session_user_idx` ON `auth_session` (`user_id`);--> statement-breakpoint
CREATE INDEX `auth_session_expires_idx` ON `auth_session` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `auth_session_token_idx` ON `auth_session` (`token`);--> statement-breakpoint
CREATE TABLE `auth_verification_token` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`type` text(50),
	`identifier` text(255) NOT NULL,
	`value` text(4000) NOT NULL,
	`expiresAt` integer NOT NULL,
	`consumedAt` integer
);
--> statement-breakpoint
CREATE INDEX `auth_verif_identifier_idx` ON `auth_verification_token` (`identifier`);--> statement-breakpoint
CREATE INDEX `auth_verif_value_idx` ON `auth_verification_token` (`value`);--> statement-breakpoint
CREATE INDEX `auth_verif_expires_idx` ON `auth_verification_token` (`expiresAt`);--> statement-breakpoint
CREATE TABLE `workspace_member` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text(50) DEFAULT 'member' NOT NULL,
	FOREIGN KEY (`workspace_id`) REFERENCES `workspace`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `workspace_member_workspace_idx` ON `workspace_member` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `workspace_member_user_idx` ON `workspace_member` (`user_id`);--> statement-breakpoint
CREATE INDEX `workspace_member_pair_idx` ON `workspace_member` (`workspace_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `workspace` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`slug` text(255) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workspace_slug_unique` ON `workspace` (`slug`);--> statement-breakpoint
CREATE INDEX `workspace_slug_idx` ON `workspace` (`slug`);--> statement-breakpoint
CREATE TABLE `note` (
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`update_counter` integer DEFAULT 0,
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text(255) NOT NULL,
	`body` text(4000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `note_user_idx` ON `note` (`user_id`);--> statement-breakpoint
CREATE INDEX `note_created_idx` ON `note` (`created_at`);