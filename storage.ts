import { 
  clients, metrics, posts, scheduledReports, alerts,
  type Client, type InsertClient,
  type Metric, type InsertMetric,
  type Post, type InsertPost,
  type ScheduledReport, type InsertScheduledReport,
  type Alert, type InsertAlert
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // Clients
  getAllClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  
  // Metrics
  getMetricsByClient(clientId: number, platform?: string, startDate?: Date, endDate?: Date): Promise<Metric[]>;
  createMetric(metric: InsertMetric): Promise<Metric>;
  getLatestMetrics(clientId: number): Promise<Metric[]>;
  
  // Posts
  getPostsByClient(clientId: number, platform?: string, limit?: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  getTopPerformingPosts(clientId: number, limit?: number): Promise<Post[]>;
  
  // Scheduled Reports
  getScheduledReportsByClient(clientId: number): Promise<ScheduledReport[]>;
  createScheduledReport(report: InsertScheduledReport): Promise<ScheduledReport>;
  updateScheduledReport(id: number, report: Partial<InsertScheduledReport>): Promise<ScheduledReport | undefined>;
  
  // Alerts
  getAlertsByClient(clientId: number, unreadOnly?: boolean): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  markAlertAsRead(id: number): Promise<Alert | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: number, clientUpdate: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(clientUpdate)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async getMetricsByClient(clientId: number, platform?: string, startDate?: Date, endDate?: Date): Promise<Metric[]> {
    let query = db.select().from(metrics).where(eq(metrics.clientId, clientId));
    
    const conditions = [eq(metrics.clientId, clientId)];
    
    if (platform) {
      conditions.push(eq(metrics.platform, platform));
    }
    
    if (startDate) {
      conditions.push(gte(metrics.date, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(metrics.date, endDate));
    }
    
    return await db.select().from(metrics).where(and(...conditions)).orderBy(desc(metrics.date));
  }

  async createMetric(insertMetric: InsertMetric): Promise<Metric> {
    const [metric] = await db
      .insert(metrics)
      .values(insertMetric)
      .returning();
    return metric;
  }

  async getLatestMetrics(clientId: number): Promise<Metric[]> {
    return await db.select().from(metrics)
      .where(eq(metrics.clientId, clientId))
      .orderBy(desc(metrics.date))
      .limit(30);
  }

  async getPostsByClient(clientId: number, platform?: string, limit?: number): Promise<Post[]> {
    const conditions = [eq(posts.clientId, clientId)];
    
    if (platform) {
      conditions.push(eq(posts.platform, platform));
    }
    
    const query = db.select().from(posts).where(and(...conditions)).orderBy(desc(posts.publishedAt));
    
    if (limit) {
      return await query.limit(limit);
    }
    
    return await query;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();
    return post;
  }

  async getTopPerformingPosts(clientId: number, limit = 10): Promise<Post[]> {
    return await db.select().from(posts)
      .where(eq(posts.clientId, clientId))
      .orderBy(desc(posts.engagementRate))
      .limit(limit);
  }

  async getScheduledReportsByClient(clientId: number): Promise<ScheduledReport[]> {
    return await db.select().from(scheduledReports)
      .where(eq(scheduledReports.clientId, clientId))
      .orderBy(desc(scheduledReports.createdAt));
  }

  async createScheduledReport(insertReport: InsertScheduledReport): Promise<ScheduledReport> {
    const [report] = await db
      .insert(scheduledReports)
      .values(insertReport)
      .returning();
    return report;
  }

  async updateScheduledReport(id: number, reportUpdate: Partial<InsertScheduledReport>): Promise<ScheduledReport | undefined> {
    const [report] = await db
      .update(scheduledReports)
      .set(reportUpdate)
      .where(eq(scheduledReports.id, id))
      .returning();
    return report || undefined;
  }

  async getAlertsByClient(clientId: number, unreadOnly = false): Promise<Alert[]> {
    const conditions = [eq(alerts.clientId, clientId)];
    
    if (unreadOnly) {
      conditions.push(eq(alerts.isRead, false));
    }
    
    return await db.select().from(alerts)
      .where(and(...conditions))
      .orderBy(desc(alerts.createdAt));
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const [alert] = await db
      .insert(alerts)
      .values(insertAlert)
      .returning();
    return alert;
  }

  async markAlertAsRead(id: number): Promise<Alert | undefined> {
    const [alert] = await db
      .update(alerts)
      .set({ isRead: true })
      .where(eq(alerts.id, id))
      .returning();
    return alert || undefined;
  }
}

export class MemStorage implements IStorage {
  private clients: Map<number, Client> = new Map();
  private metrics: Map<number, Metric> = new Map();
  private posts: Map<number, Post> = new Map();
  private scheduledReports: Map<number, ScheduledReport> = new Map();
  private alerts: Map<number, Alert> = new Map();
  
  private currentClientId = 1;
  private currentMetricId = 1;
  private currentPostId = 1;
  private currentReportId = 1;
  private currentAlertId = 1;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Create sample client
    const client = await this.createClient({
      name: "TechCorp Inc.",
      metaAccessToken: process.env.META_ACCESS_TOKEN || null,
      instagramAccessToken: process.env.INSTAGRAM_ACCESS_TOKEN || null,
      metaPageId: process.env.META_PAGE_ID || null,
      instagramAccountId: process.env.INSTAGRAM_ACCOUNT_ID || null,
    });

    // Create sample metrics for the past 30 days
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Meta metrics
      await this.createMetric({
        clientId: client.id,
        platform: 'meta',
        date,
        reach: Math.floor(Math.random() * 5000) + 2000,
        impressions: Math.floor(Math.random() * 8000) + 3000,
        engagement: Math.floor(Math.random() * 500) + 200,
        followers: 12450 + Math.floor(Math.random() * 100),
        likes: Math.floor(Math.random() * 300) + 100,
        comments: Math.floor(Math.random() * 50) + 10,
        shares: Math.floor(Math.random() * 30) + 5,
      });

      // Instagram metrics
      await this.createMetric({
        clientId: client.id,
        platform: 'instagram',
        date,
        reach: Math.floor(Math.random() * 4000) + 1500,
        impressions: Math.floor(Math.random() * 6000) + 2500,
        engagement: Math.floor(Math.random() * 400) + 150,
        followers: 8320 + Math.floor(Math.random() * 80),
        likes: Math.floor(Math.random() * 250) + 80,
        comments: Math.floor(Math.random() * 40) + 8,
        shares: Math.floor(Math.random() * 20) + 3,
      });

      // Twitter metrics
      await this.createMetric({
        clientId: client.id,
        platform: 'twitter',
        date,
        reach: Math.floor(Math.random() * 3500) + 1200,
        impressions: Math.floor(Math.random() * 5500) + 2000,
        engagement: Math.floor(Math.random() * 350) + 120,
        followers: 6750 + Math.floor(Math.random() * 60),
        likes: Math.floor(Math.random() * 200) + 60,
        comments: Math.floor(Math.random() * 35) + 5,
        shares: Math.floor(Math.random() * 25) + 2,
      });

      // LinkedIn metrics
      await this.createMetric({
        clientId: client.id,
        platform: 'linkedin',
        date,
        reach: Math.floor(Math.random() * 2500) + 800,
        impressions: Math.floor(Math.random() * 4000) + 1500,
        engagement: Math.floor(Math.random() * 250) + 80,
        followers: 4320 + Math.floor(Math.random() * 40),
        likes: Math.floor(Math.random() * 150) + 40,
        comments: Math.floor(Math.random() * 25) + 3,
        shares: Math.floor(Math.random() * 15) + 1,
      });

      // TikTok metrics
      await this.createMetric({
        clientId: client.id,
        platform: 'tiktok',
        date,
        reach: Math.floor(Math.random() * 6000) + 2500,
        impressions: Math.floor(Math.random() * 9000) + 4000,
        engagement: Math.floor(Math.random() * 600) + 250,
        followers: 11800 + Math.floor(Math.random() * 120),
        likes: Math.floor(Math.random() * 400) + 150,
        comments: Math.floor(Math.random() * 60) + 15,
        shares: Math.floor(Math.random() * 40) + 8,
      });
    }

    // Create sample posts
    const samplePosts = [
      {
        platform: 'meta',
        content: 'Excited to announce our latest product launch! Revolutionary tech that will change how you work.',
        likes: 245,
        comments: 32,
        shares: 18,
        reach: 3200,
        impressions: 4500,
      },
      {
        platform: 'instagram',
        content: 'Behind the scenes of our amazing team working hard to deliver excellence. #teamwork #innovation',
        likes: 189,
        comments: 24,
        shares: 12,
        reach: 2800,
        impressions: 3600,
      },
      {
        platform: 'meta',
        content: 'Customer success story: How TechCorp helped increase efficiency by 300%. Read more in comments.',
        likes: 156,
        comments: 45,
        shares: 28,
        reach: 2900,
        impressions: 3800,
      },
      {
        platform: 'instagram',
        content: 'New office space reveal! Modern, sustainable, and designed for collaboration. What do you think?',
        likes: 312,
        comments: 67,
        shares: 23,
        reach: 4100,
        impressions: 5200,
      },
      {
        platform: 'twitter',
        content: 'Breaking: TechCorp announces partnership with leading AI companies. The future of work is here! #AI #Innovation',
        likes: 187,
        comments: 34,
        shares: 56,
        reach: 2800,
        impressions: 3500,
      },
      {
        platform: 'linkedin',
        content: 'Thought leadership: How remote work transformed our company culture and boosted productivity by 40%.',
        likes: 124,
        comments: 28,
        shares: 15,
        reach: 1900,
        impressions: 2400,
      },
      {
        platform: 'tiktok',
        content: 'Day in the life at TechCorp: From morning standup to product demos. Come work with us! #TechLife',
        likes: 432,
        comments: 89,
        shares: 67,
        reach: 5600,
        impressions: 7200,
      },
    ];

    for (const post of samplePosts) {
      await this.createPost({
        clientId: client.id,
        platform: post.platform,
        externalId: `${post.platform}_${Date.now()}_${Math.random()}`,
        content: post.content,
        imageUrl: null,
        publishedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        reach: post.reach,
        impressions: post.impressions,
        engagementRate: Math.floor(((post.likes + post.comments + post.shares) / post.impressions) * 100),
      });
    }
  }

  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const client: Client = {
      id,
      name: insertClient.name,
      metaAccessToken: insertClient.metaAccessToken || null,
      instagramAccessToken: insertClient.instagramAccessToken || null,
      twitterAccessToken: insertClient.twitterAccessToken || null,
      linkedinAccessToken: insertClient.linkedinAccessToken || null,
      tiktokAccessToken: insertClient.tiktokAccessToken || null,
      metaPageId: insertClient.metaPageId || null,
      instagramAccountId: insertClient.instagramAccountId || null,
      twitterUserId: insertClient.twitterUserId || null,
      linkedinPageId: insertClient.linkedinPageId || null,
      tiktokUserId: insertClient.tiktokUserId || null,
      createdAt: new Date(),
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, clientUpdate: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient = { ...client, ...clientUpdate };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async getMetricsByClient(clientId: number, platform?: string, startDate?: Date, endDate?: Date): Promise<Metric[]> {
    return Array.from(this.metrics.values()).filter(metric => {
      if (metric.clientId !== clientId) return false;
      if (platform && metric.platform !== platform) return false;
      if (startDate && metric.date < startDate) return false;
      if (endDate && metric.date > endDate) return false;
      return true;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async createMetric(insertMetric: InsertMetric): Promise<Metric> {
    const id = this.currentMetricId++;
    const metric: Metric = {
      id,
      clientId: insertMetric.clientId,
      platform: insertMetric.platform,
      date: insertMetric.date,
      reach: insertMetric.reach || null,
      impressions: insertMetric.impressions || null,
      engagement: insertMetric.engagement || null,
      followers: insertMetric.followers || null,
      likes: insertMetric.likes || null,
      comments: insertMetric.comments || null,
      shares: insertMetric.shares || null,
    };
    this.metrics.set(id, metric);
    return metric;
  }

  async getLatestMetrics(clientId: number): Promise<Metric[]> {
    const allMetrics = await this.getMetricsByClient(clientId);
    const latestByPlatform = new Map<string, Metric>();
    
    for (const metric of allMetrics) {
      const existing = latestByPlatform.get(metric.platform);
      if (!existing || metric.date > existing.date) {
        latestByPlatform.set(metric.platform, metric);
      }
    }
    
    return Array.from(latestByPlatform.values());
  }

  async getPostsByClient(clientId: number, platform?: string, limit?: number): Promise<Post[]> {
    let posts = Array.from(this.posts.values()).filter(post => {
      if (post.clientId !== clientId) return false;
      if (platform && post.platform !== platform) return false;
      return true;
    }).sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    
    if (limit) {
      posts = posts.slice(0, limit);
    }
    
    return posts;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const post: Post = {
      id,
      clientId: insertPost.clientId,
      platform: insertPost.platform,
      externalId: insertPost.externalId,
      content: insertPost.content,
      imageUrl: insertPost.imageUrl || null,
      publishedAt: insertPost.publishedAt,
      likes: insertPost.likes || null,
      comments: insertPost.comments || null,
      shares: insertPost.shares || null,
      reach: insertPost.reach || null,
      impressions: insertPost.impressions || null,
      engagementRate: insertPost.engagementRate || null,
    };
    this.posts.set(id, post);
    return post;
  }

  async getTopPerformingPosts(clientId: number, limit = 10): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.clientId === clientId)
      .sort((a, b) => {
        const aEngagement = (a.likes || 0) + (a.comments || 0) + (a.shares || 0);
        const bEngagement = (b.likes || 0) + (b.comments || 0) + (b.shares || 0);
        return bEngagement - aEngagement;
      })
      .slice(0, limit);
  }

  async getScheduledReportsByClient(clientId: number): Promise<ScheduledReport[]> {
    return Array.from(this.scheduledReports.values())
      .filter(report => report.clientId === clientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createScheduledReport(insertReport: InsertScheduledReport): Promise<ScheduledReport> {
    const id = this.currentReportId++;
    const report: ScheduledReport = {
      id,
      clientId: insertReport.clientId,
      name: insertReport.name,
      schedule: insertReport.schedule,
      emailRecipients: insertReport.emailRecipients,
      isActive: insertReport.isActive || null,
      lastSent: null,
      createdAt: new Date(),
    };
    this.scheduledReports.set(id, report);
    return report;
  }

  async updateScheduledReport(id: number, reportUpdate: Partial<InsertScheduledReport>): Promise<ScheduledReport | undefined> {
    const report = this.scheduledReports.get(id);
    if (!report) return undefined;
    
    const updatedReport = { ...report, ...reportUpdate };
    this.scheduledReports.set(id, updatedReport);
    return updatedReport;
  }

  async getAlertsByClient(clientId: number, unreadOnly = false): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter(alert => {
        if (alert.clientId !== clientId) return false;
        if (unreadOnly && alert.isRead) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const alert: Alert = {
      id,
      clientId: insertAlert.clientId,
      type: insertAlert.type,
      title: insertAlert.title,
      message: insertAlert.message,
      isRead: insertAlert.isRead || null,
      createdAt: new Date(),
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async markAlertAsRead(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, isRead: true };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }
}

export const storage = new DatabaseStorage();
