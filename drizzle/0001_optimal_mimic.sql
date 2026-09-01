CREATE TABLE `mentorInteractions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`kind` enum('assist','practice') NOT NULL,
	`prompt` text NOT NULL,
	`response` text NOT NULL,
	`context` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mentorInteractions_id` PRIMARY KEY(`id`)
);
