import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { metaApi } from "./metaApi";
import { pdfGenerator } from "./pdfGenerator";
import { emailService } from "./emailService";
import { scheduler } from "./scheduler";
import { syncRealDataForClient } from "./syncRealData";
import { insertClientSchema, insertScheduledReportSchema, timePeriodSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Start the scheduler
  scheduler.start();

  // Get all clients
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getAllClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  // Create a new client
  app.post("/api/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.json(client);
    } catch (error) {
      res.status(400).json({ error: "Invalid client data" });
    }
  });

  // Get a specific client
  app.get("/api/clients/:id", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  // Update a client
  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const updateData = req.body;
      
      const client = await storage.updateClient(clientId, updateData);
      
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  // Get client dashboard data
  app.get("/api/clients/:id/dashboard", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const period = timePeriodSchema.parse(req.query.period || '7d');
      const customStart = req.query.customStart as string;
      const customEnd = req.query.customEnd as string;

      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // Calculate date ranges
      const { since, until } = metaApi.getDatesForPeriod(period, customStart, customEnd);
      const currentStart = new Date(since);
      const currentEnd = new Date(until);
      
      // Calculate previous period for comparison
      const periodDuration = currentEnd.getTime() - currentStart.getTime();
      const previousStart = new Date(currentStart.getTime() - periodDuration);
      const previousEnd = new Date(currentStart.getTime());

      // Get current period metrics
      const currentMetrics = await storage.getMetricsByClient(
        clientId,
        undefined,
        currentStart,
        currentEnd
      );

      // Get previous period metrics for comparison
      const previousMetrics = await storage.getMetricsByClient(
        clientId,
        undefined,
        previousStart,
        previousEnd
      );

      // Get top performing posts
      const topPosts = await storage.getTopPerformingPosts(clientId, 10);

      // Get latest follower counts
      const latestMetrics = await storage.getLatestMetrics(clientId);

      // Aggregate metrics by platform
      const aggregateMetrics = (metrics: any[]) => {
        return metrics.reduce((acc, metric) => {
          if (!acc[metric.platform]) {
            acc[metric.platform] = {
              reach: 0,
              impressions: 0,
              engagement: 0,
              followers: 0,
              likes: 0,
              comments: 0,
              shares: 0,
            };
          }
          acc[metric.platform].reach += metric.reach || 0;
          acc[metric.platform].impressions += metric.impressions || 0;
          acc[metric.platform].engagement += metric.engagement || 0;
          acc[metric.platform].followers = Math.max(acc[metric.platform].followers, metric.followers || 0);
          acc[metric.platform].likes += metric.likes || 0;
          acc[metric.platform].comments += metric.comments || 0;
          acc[metric.platform].shares += metric.shares || 0;
          return acc;
        }, {} as any);
      };

      const currentAggregated = aggregateMetrics(currentMetrics);
      const previousAggregated = aggregateMetrics(previousMetrics);

      // Calculate totals and changes
      const calculateTotals = (aggregated: any) => {
        const platforms = Object.keys(aggregated);
        return platforms.reduce((total, platform) => {
          const metrics = aggregated[platform];
          return {
            reach: total.reach + metrics.reach,
            impressions: total.impressions + metrics.impressions,
            engagement: total.engagement + metrics.engagement,
            followers: total.followers + metrics.followers,
            likes: total.likes + metrics.likes,
            comments: total.comments + metrics.comments,
            shares: total.shares + metrics.shares,
          };
        }, { reach: 0, impressions: 0, engagement: 0, followers: 0, likes: 0, comments: 0, shares: 0 });
      };

      const currentTotals = calculateTotals(currentAggregated);
      const previousTotals = calculateTotals(previousAggregated);

      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      const changes = {
        reach: calculateChange(currentTotals.reach, previousTotals.reach),
        impressions: calculateChange(currentTotals.impressions, previousTotals.impressions),
        engagement: calculateChange(currentTotals.engagement, previousTotals.engagement),
        followers: calculateChange(currentTotals.followers, previousTotals.followers),
      };

      res.json({
        client,
        metrics: {
          current: currentTotals,
          previous: previousTotals,
          changes,
          byPlatform: currentAggregated,
        },
        topPosts,
        latestMetrics,
        period: {
          current: { start: currentStart, end: currentEnd },
          previous: { start: previousStart, end: previousEnd },
        },
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  // Get metrics for charts
  app.get("/api/clients/:id/metrics/chart", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const period = timePeriodSchema.parse(req.query.period || '7d');
      const platform = req.query.platform as string;
      const customStart = req.query.startDate as string;
      const customEnd = req.query.endDate as string;

      // Handle custom date ranges
      let since: string, until: string;
      if (period === 'custom' && customStart && customEnd) {
        since = customStart;
        until = customEnd;
      } else {
        const dates = metaApi.getDatesForPeriod(period);
        since = dates.since;
        until = dates.until;
      }

      const metrics = await storage.getMetricsByClient(
        clientId,
        platform,
        new Date(since),
        new Date(until)
      );

      // Group metrics by date
      const chartData = metrics.reduce((acc, metric) => {
        const dateKey = metric.date.toISOString().split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            meta: { engagement: 0, reach: 0, impressions: 0 },
            instagram: { engagement: 0, reach: 0, impressions: 0 },
          };
        }
        acc[dateKey][metric.platform as 'meta' | 'instagram'] = {
          engagement: metric.engagement || 0,
          reach: metric.reach || 0,
          impressions: metric.impressions || 0,
        };
        return acc;
      }, {} as any);

      const sortedData = Object.values(chartData).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      res.json(sortedData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });

  // Sync client data manually
  app.post("/api/clients/:id/sync", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const client = await storage.getClient(clientId);
      
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // Trigger real data sync with new token
      await syncRealDataForClient(clientId);
      res.json({ message: "Real data sync completed" });
    } catch (error) {
      console.error("Sync error:", error);
      res.status(500).json({ error: "Failed to sync data" });
    }
  });

  // Get posts for a client
  app.get("/api/clients/:id/posts", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const platform = req.query.platform as string;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const posts = await storage.getPostsByClient(clientId, platform, limit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Get top performing posts for a client
  app.get("/api/clients/:id/posts/top", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const limit = parseInt(req.query.limit as string) || 10;
      
      const posts = await storage.getTopPerformingPosts(clientId, limit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top posts" });
    }
  });

  // Get scheduled reports for a client
  app.get("/api/clients/:id/reports", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const reports = await storage.getScheduledReportsByClient(clientId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  // Create a new scheduled report
  app.post("/api/clients/:id/reports", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const reportData = insertScheduledReportSchema.parse({
        ...req.body,
        clientId,
      });
      
      const report = await storage.createScheduledReport(reportData);
      res.json(report);
    } catch (error) {
      res.status(400).json({ error: "Invalid report data" });
    }
  });

  // Generate and download PDF report
  app.post("/api/clients/:id/reports/generate", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const period = req.body.period || '30d';

      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // Get data for report
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      
      const currentMetrics = await storage.getMetricsByClient(clientId, undefined, thirtyDaysAgo, now);
      const previousMetrics = await storage.getMetricsByClient(clientId, undefined, sixtyDaysAgo, thirtyDaysAgo);
      const topPosts = await storage.getTopPerformingPosts(clientId, 5);

      const reportData = {
        client,
        metrics: { current: currentMetrics, previous: previousMetrics },
        topPosts,
        period: `Last ${period}`,
        generatedAt: now,
      };

      const pdfBuffer = await pdfGenerator.generateReport(reportData);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${client.name.replace(/[^a-zA-Z0-9]/g, '_')}_report.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // Get alerts for a client
  app.get("/api/clients/:id/alerts", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const unreadOnly = req.query.unreadOnly === 'true';
      const alerts = await storage.getAlertsByClient(clientId, unreadOnly);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // Mark alert as read
  app.patch("/api/alerts/:id/read", async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      const alert = await storage.markAlertAsRead(alertId);
      
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark alert as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
