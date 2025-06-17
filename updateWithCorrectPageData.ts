import { db } from "./db";
import { clients, metrics, posts } from "@shared/schema";
import { metaApi } from "./metaApi";
import { eq } from "drizzle-orm";

async function updateWithCorrectPageData() {
  try {
    const accessToken = 'EAAOAE00gq0kBO42AVDNIE08s2GKsHE0tNEK20pfynY9XggsoZACdoaOMgEyYtsuhWtzbZAznp3bUkudLr3P21ZAzkJeXPhgO2ipA3AyZADvY8N6AggN1n6dmEahK8j3UvfXEEsfTltOeDbZBLZA8ZBfr2r4wZCjv2ZCrZAwZBvX2HAbLZBTZBlzcz2uoWAwhBYgYb994VwZC9Wul0UQZBWCXazl8XHok90ZD';
    const pageId = '446365348569001';
    
    // Get page info
    const pageInfo = await metaApi.makeRequest(
      `/${pageId}?fields=id,name,category,fan_count`,
      accessToken
    );
    
    console.log(`Page: ${pageInfo.name}`);
    console.log(`Fans: ${pageInfo.fan_count}`);
    
    // Update client with correct page name
    await db
      .update(clients)
      .set({
        name: pageInfo.name
      })
      .where(eq(clients.id, 1));
    
    // Clear old data and add real metrics
    await db.delete(metrics);
    
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      await db.insert(metrics).values({
        clientId: 1,
        platform: 'meta',
        date,
        reach: 0,
        impressions: 0,
        engagement: 0,
        followers: pageInfo.fan_count,
        likes: 0,
        comments: 0,
        shares: 0,
      });
      
      await db.insert(metrics).values({
        clientId: 1,
        platform: 'instagram',
        date,
        reach: 0,
        impressions: 0,
        engagement: 0,
        followers: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      });
    }
    
    console.log('Updated client with correct page data');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

updateWithCorrectPageData();