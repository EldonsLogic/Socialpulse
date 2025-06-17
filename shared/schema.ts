import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  metaAccessToken: text("meta_access_token"),
  instagramAccessToken: text("instagram_access_token"),
  twitterAccessToken: text("twitter_access_token"),
  linkedinAccessToken: text("linkedin_access_token"),
  tiktokAccessToken: text("tiktok_access_token"),
  metaPageId: text("meta_page_id"),
  instagramAccountId: text("instagram_account_id"),
  twitterUserId: text("twitter_user_id"),
  linkedinPageId: text("linkedin_page_id"),
  tiktokUserId: text("tiktok_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  platform: text("platform").notNull(), // 'meta' or 'instagram'
  date: timestamp("date").notNull(),
  reach: integer("reach").default(0),
  impressions: integer("impressions").default(0),
  engagement: integer("engagement").default(0),
  followers: integer("followers").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  platform: text("platform").notNull(),
  externalId: text("external_id").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at").notNull(),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  reach: integer("reach").default(0),
  impressions: integer("impressions").default(0),
  engagementRate: integer("engagement_rate").default(0), // stored as percentage * 100
});

export const scheduledReports = pgTable("scheduled_reports", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  name: text("name").notNull(),
  schedule: text("schedule").notNull(), // cron expression
  emailRecipients: text("email_recipients").array().notNull(),
  isActive: boolean("is_active").default(true),
  lastSent: timestamp("last_sent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  type: text("type").notNull(), // 'engagement_drop', 'goal_achieved', etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertMetricSchema = createInsertSchema(metrics).omit({
  id: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
});

export const insertScheduledReportSchema = createInsertSchema(scheduledReports).omit({
  id: true,
  lastSent: true,
  createdAt: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

// Types
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type ScheduledReport = typeof scheduledReports.$inferSelect;
export type InsertScheduledReport = z.infer<typeof insertScheduledReportSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

// Additional types for API responses
export const timePeriodSchema = z.enum(['7d', '30d', '90d', 'custom']);
export type TimePeriod = z.infer<typeof timePeriodSchema>;

export const platformSchema = z.enum(['meta', 'instagram', 'twitter', 'linkedin', 'tiktok']);
export type Platform = z.infer<typeof platformSchema>;
