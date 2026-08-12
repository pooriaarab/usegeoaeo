CREATE TABLE `invitation` (
	`id` text PRIMARY KEY NOT NULL,
	`organizationId` text NOT NULL,
	`email` text(255) NOT NULL,
	`role` text(50) NOT NULL,
	`status` text(50) DEFAULT 'pending' NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`inviterId` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `auth_invitation_organization_idx` ON `invitation` (`organizationId`);--> statement-breakpoint
CREATE INDEX `auth_invitation_email_idx` ON `invitation` (`email`);--> statement-breakpoint
CREATE INDEX `auth_invitation_inviter_idx` ON `invitation` (`inviterId`);--> statement-breakpoint
CREATE TABLE `member` (
	`id` text PRIMARY KEY NOT NULL,
	`organizationId` text NOT NULL,
	`userId` text NOT NULL,
	`role` text(50) NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `auth_member_organization_idx` ON `member` (`organizationId`);--> statement-breakpoint
CREATE INDEX `auth_member_user_idx` ON `member` (`userId`);--> statement-breakpoint
CREATE TABLE `organization` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text(255) NOT NULL,
	`slug` text(255) NOT NULL,
	`logo` text(600),
	`metadata` text(4000),
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organization_slug_unique` ON `organization` (`slug`);--> statement-breakpoint
CREATE INDEX `auth_organization_slug_idx` ON `organization` (`slug`);