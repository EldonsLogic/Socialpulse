import { storage } from "./storage";
import { metaApi } from "./metaApi";
import { pdfGenerator } from "./pdfGenerator";
import { emailService } from "./emailService";

interface ScheduleTask {
  id: string;
  clientId: number;
  reportId: number;
  cronExpression: string;
  isActive: boolean;
}

export class SchedulerService {
  private tasks: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('📅 Scheduler service started');
    
    // Check for scheduled reports every minute
    this.scheduleTask('main-scheduler', () => this.checkScheduledReports(), 60000);
    
    // Sync data every 5 minutes
    this.scheduleTask('data-sync', () => this.syncAllClientData(), 300000);
  }

  stop(): void {
    this.tasks.forEach(timeout => clearTimeout(timeout));
    this.tasks.clear();
    this.isRunning = false;
    console.log('📅 Scheduler service stopped');
  }

  private scheduleTask(id: string, task: () => void, intervalMs: number): void {
    const timeout = setInterval(task, intervalMs);
    this.tasks.set(id, timeout);
  }

  private async checkScheduledReports(): Promise<void> {
    try {
      const clients = await storage.getAllClients();
      
      for (const client of clients) {
        const reports = await storage.getScheduledReportsByClient(client.id);
        
        for (const report of reports) {
          if (!report.isActive) continue;
          
          if (this.shouldExecuteReport(report)) {
            await this.executeReport(client.id, report.id);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error checking scheduled reports:', error);
    }
  }

  private shouldExecuteReport(report: any): boolean {
    // Simple cron-like logic for demo
    // In production, use a proper cron library
    const now = new Date();
    const lastSent = report.lastSent ? new Date(report.lastSent) : null;
    
    // Parse simple schedule formats
    switch (report.schedule) {
      case 'daily':
        return !lastSent || (now.getTime() - lastSent.getTime()) >= 24 * 60 * 60 * 1000;
      case 'weekly':
        return !lastSent || (now.getTime() - lastSent.getTime()) >= 7 * 24 * 60 * 60 * 1000;
      case 'monthly':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return !lastSent || lastSent < monthAgo;
      default:
        return false;
    }
  }

  private async executeReport(clientId: number, reportId: number): Promise<void> {
    try {
      console.log(`📊 Executing report ${reportId} for client ${clientId}`);
      
      const client = await storage.getClient(clientId);
      const report = await storage.getScheduledReportsByClient(clientId);
      const targetReport = report.find(r => r.id === reportId);
      
      if (!client || !targetReport) {
        console.error('❌ Client or report not found');
        return;
      }

      // Get metrics for current and previous periods
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      
      const currentMetrics = await storage.getMetricsByClient(
        clientId,
        undefined,
        thirtyDaysAgo,
        now
      );
      
      const previousMetrics = await storage.getMetricsByClient(
        clientId,
        undefined,
        sixtyDaysAgo,
        thirtyDaysAgo
      );

      const topPosts = await storage.getTopPerformingPosts(clientId, 5);

      // Generate PDF report
      const reportData = {
        client,
        metrics: {
          current: currentMetrics,
          previous: previousMetrics,
        },
        topPosts,
        period: 'Last 30 days',
        generatedAt: now,
      };

      const pdfBuffer = await pdfGenerator.generateReport(reportData);

      // Send email
      const emailSent = await emailService.sendReportEmail(
        targetReport.emailRecipients,
        client.name,
        pdfBuffer,
        'Last 30 days'
      );

      if (emailSent) {
        // Update last sent timestamp
        await storage.updateScheduledReport(reportId, {
          lastSent: now,
        });
        console.log(`✅ Report sent successfully for client ${client.name}`);
      } else {
        console.error(`❌ Failed to send report for client ${client.name}`);
      }
    } catch (error) {
      console.error('❌ Error executing report:', error);
    }
  }

  private async syncAllClientData(): Promise<void> {
    try {
      console.log('🔄 Syncing data for all clients...');
      
      const clients = await storage.getAllClients();
      
      for (const client of clients) {
        await this.syncClientData(client);
      }
      
      console.log('✅ Data sync completed');
    } catch (error) {
      console.error('❌ Error during data sync:', error);
    }
  }

  private async syncClientData(client: any): Promise<void> {
    try {
      if (!client.metaAccessToken && !client.instagramAccessToken) {
        return; // Skip clients without tokens
      }

      const now = new Date();
      
      // Sync Meta data
      if (client.metaAccessToken && client.metaPageId) {
        await this.syncMetaData(client, now);
      }
      
      // Sync Instagram data
      if (client.instagramAccessToken && client.instagramAccountId) {
        await this.syncInstagramData(client, now);
      }
    } catch (error) {
      console.error(`❌ Error syncing data for client ${client.name}:`, error);
    }
  }

  private async syncMetaData(client: any, date: Date): Promise<void> {
    try {
      // Get basic page info and available metrics
      const pageInfo = await metaApi.makeRequest(
        `/${client.metaPageId}?fields=id,name,category,fan_count`,
        client.metaAccessToken
      );

      // Create metric record with real page data
      const metric = {
        clientId: client.id,
        platform: 'meta' as const,
        date,
        reach: 0,
        impressions: 0, 
        engagement: 0,
        followers: pageInfo.fan_count || 0,
        likes: 0,
        comments: 0,
        shares: 0,
      };

      await storage.createMetric(metric);

      // Sync recent posts
      const posts = await metaApi.makeRequest(
        `/${client.metaPageId}/posts?fields=id,message,created_time,likes.limit(0).summary(true),comments.limit(0).summary(true)&limit=10`,
        client.metaAccessToken
      );
      
      if (posts.data?.length > 0) {
        await this.processMetaPosts(posts, client.id);
      }
      
    } catch (error) {
      console.error('❌ Error syncing Meta data:', error);
    }
  }

  private async syncInstagramData(client: any, date: Date): Promise<void> {
    try {
      // For now, create placeholder Instagram metrics since we need the proper Business Account ID
      const metric = {
        clientId: client.id,
        platform: 'instagram' as const,
        date,
        reach: 0,
        impressions: 0,
        engagement: 0,
        followers: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      };

      await storage.createMetric(metric);
      
    } catch (error) {
      console.error('❌ Error syncing Instagram data:', error);
    }
  }

  private processMetaInsights(insights: any, clientId: number, date: Date): any {
    // Process Meta insights response and return metric object
    const values = insights.data.reduce((acc: any, insight: any) => {
      const latestValue = insight.values[insight.values.length - 1]?.value || 0;
      switch (insight.name) {
        case 'page_impressions':
          acc.impressions = latestValue;
          break;
        case 'page_engaged_users':
          acc.engagement = latestValue;
          break;
        case 'page_fans':
          acc.followers = latestValue;
          break;
      }
      return acc;
    }, {});

    return {
      clientId,
      platform: 'meta',
      date,
      reach: values.reach || 0,
      impressions: values.impressions || 0,
      engagement: values.engagement || 0,
      followers: values.followers || 0,
      likes: 0,
      comments: 0,
      shares: 0,
    };
  }

  private processInstagramInsights(insights: any, clientId: number, date: Date): any {
    // Process Instagram insights response and return metric object
    const values = insights.data.reduce((acc: any, insight: any) => {
      const latestValue = insight.values[insight.values.length - 1]?.value || 0;
      switch (insight.name) {
        case 'impressions':
          acc.impressions = latestValue;
          break;
        case 'reach':
          acc.reach = latestValue;
          break;
        case 'profile_views':
          acc.engagement = latestValue;
          break;
      }
      return acc;
    }, {});

    return {
      clientId,
      platform: 'instagram',
      date,
      reach: values.reach || 0,
      impressions: values.impressions || 0,
      engagement: values.engagement || 0,
      followers: values.followers || 0,
      likes: 0,
      comments: 0,
      shares: 0,
    };
  }

  private async processMetaPosts(posts: any, clientId: number): Promise<void> {
    // Process and store Meta posts
    for (const post of posts.data || []) {
      const postData = {
        clientId,
        platform: 'meta',
        externalId: post.id,
        content: post.message || '',
        imageUrl: post.attachments?.data[0]?.media?.image?.src || null,
        publishedAt: new Date(post.created_time),
        likes: post.insights?.data?.find((i: any) => i.name.includes('reactions'))?.values[0]?.value || 0,
        comments: post.insights?.data?.find((i: any) => i.name === 'post_comments')?.values[0]?.value || 0,
        shares: post.insights?.data?.find((i: any) => i.name === 'post_shares')?.values[0]?.value || 0,
        reach: 0,
        impressions: post.insights?.data?.find((i: any) => i.name === 'post_impressions')?.values[0]?.value || 0,
        engagementRate: 0,
      };

      await storage.createPost(postData);
    }
  }

  private async processInstagramMedia(media: any, clientId: number): Promise<void> {
    // Process and store Instagram media
    for (const item of media.data || []) {
      const postData = {
        clientId,
        platform: 'instagram',
        externalId: item.id,
        content: item.caption || '',
        imageUrl: item.media_url || item.thumbnail_url || null,
        publishedAt: new Date(item.timestamp),
        likes: item.insights?.data?.find((i: any) => i.name === 'likes')?.values[0]?.value || 0,
        comments: item.insights?.data?.find((i: any) => i.name === 'comments')?.values[0]?.value || 0,
        shares: item.insights?.data?.find((i: any) => i.name === 'shares')?.values[0]?.value || 0,
        reach: item.insights?.data?.find((i: any) => i.name === 'reach')?.values[0]?.value || 0,
        impressions: item.insights?.data?.find((i: any) => i.name === 'impressions')?.values[0]?.value || 0,
        engagementRate: 0,
      };

      await storage.createPost(postData);
    }
  }
}

export const scheduler = new SchedulerService();
