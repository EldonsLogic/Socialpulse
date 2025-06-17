import { db } from "./db";
import { clients, metrics, posts } from "@shared/schema";

async function initializeDatabase() {
  console.log("Initializing database with sample data...");

  try {
    // Check if data already exists
    const existingClients = await db.select().from(clients);
    if (existingClients.length > 0) {
      console.log("Database already has data, skipping initialization.");
      return;
    }

    // Create sample client
    const [client] = await db
      .insert(clients)
      .values({
        name: "Madina Talward",
        metaAccessToken: "EAAOAE00gq0kBO4nwAofTYXQ0cUGVKZBgBR9ITyPuPaM8Y1LJmiZAWZBe42xe7ondC3EWyDiuSZBcng3UdQl9m1Oyr0Pfz15DvUa1TSebjzdpVaRgMuRkiXZA65qZBVdZA5CzZC0lhDYap3surSR0r49yTXgQJ9ZAHv8HdPWn04xs4wYtOZBqOjFl5350My12WXkSoZD",
        instagramAccessToken: "EAAOAE00gq0kBO4nwAofTYXQ0cUGVKZBgBR9ITyPuPaM8Y1LJmiZAWZBe42xe7ondC3EWyDiuSZBcng3UdQl9m1Oyr0Pfz15DvUa1TSebjzdpVaRgMuRkiXZA65qZBVdZA5CzZC0lhDYap3surSR0r49yTXgQJ9ZAHv8HdPWn04xs4wYtOZBqOjFl5350My12WXkSoZD",
        metaPageId: "61568207521829",
        instagramAccountId: "madinatalward",
      })
      .returning();

    console.log(`Created client: ${client.name}`);

    // Create sample metrics for the past 30 days
    const now = new Date();
    const metricsData = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Meta metrics
      metricsData.push({
        clientId: client.id,
        platform: 'meta' as const,
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
      metricsData.push({
        clientId: client.id,
        platform: 'instagram' as const,
        date,
        reach: Math.floor(Math.random() * 4000) + 1500,
        impressions: Math.floor(Math.random() * 6000) + 2500,
        engagement: Math.floor(Math.random() * 400) + 150,
        followers: 8320 + Math.floor(Math.random() * 80),
        likes: Math.floor(Math.random() * 250) + 80,
        comments: Math.floor(Math.random() * 40) + 8,
        shares: Math.floor(Math.random() * 20) + 3,
      });
    }

    await db.insert(metrics).values(metricsData);
    console.log(`Created ${metricsData.length} metric records`);

    // Create sample posts
    const samplePosts = [
      {
        clientId: client.id,
        platform: 'meta' as const,
        externalId: `meta_${Date.now()}_1`,
        content: 'Excited to announce our latest product launch! Revolutionary tech that will change how you work.',
        imageUrl: null,
        publishedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        likes: 245,
        comments: 32,
        shares: 18,
        reach: 3200,
        impressions: 4500,
        engagementRate: Math.floor(((245 + 32 + 18) / 4500) * 100),
      },
      {
        clientId: client.id,
        platform: 'instagram' as const,
        externalId: `instagram_${Date.now()}_2`,
        content: 'Behind the scenes of our amazing team working hard to deliver excellence. #teamwork #innovation',
        imageUrl: null,
        publishedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        likes: 189,
        comments: 24,
        shares: 12,
        reach: 2800,
        impressions: 3600,
        engagementRate: Math.floor(((189 + 24 + 12) / 3600) * 100),
      },
      {
        clientId: client.id,
        platform: 'meta' as const,
        externalId: `meta_${Date.now()}_3`,
        content: 'Customer success story: How TechCorp helped increase efficiency by 300%. Read more in comments.',
        imageUrl: null,
        publishedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        likes: 156,
        comments: 45,
        shares: 28,
        reach: 2900,
        impressions: 3800,
        engagementRate: Math.floor(((156 + 45 + 28) / 3800) * 100),
      },
      {
        clientId: client.id,
        platform: 'instagram' as const,
        externalId: `instagram_${Date.now()}_4`,
        content: 'New office space reveal! Modern, sustainable, and designed for collaboration. What do you think?',
        imageUrl: null,
        publishedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        likes: 312,
        comments: 67,
        shares: 23,
        reach: 4100,
        impressions: 5200,
        engagementRate: Math.floor(((312 + 67 + 23) / 5200) * 100),
      },
    ];

    await db.insert(posts).values(samplePosts);
    console.log(`Created ${samplePosts.length} sample posts`);

    console.log("Database initialization completed successfully!");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}

export { initializeDatabase };