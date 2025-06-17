import { db } from "./db";
import { clients, metrics } from "@shared/schema";
import { metaApi } from "./metaApi";
import { eq, and } from "drizzle-orm";

async function updateInstagramData() {
  try {
    const accessToken = 'EAAOAE00gq0kBO42AVDNIE08s2GKsHE0tNEK20pfynY9XggsoZACdoaOMgEyYtsuhWtzbZAznp3bUkudLr3P21ZAzkJeXPhgO2ipA3AyZADvY8N6AggN1n6dmEahK8j3UvfXEEsfTltOeDbZBLZA8ZBfr2r4wZCjv2ZCrZAwZBvX2HAbLZBTZBlzcz2uoWAwhBYgYb994VwZC9Wul0UQZBWCXazl8XHok90ZD';
    const instagramAccountId = '17841469850045553';
    
    // Get Instagram account details
    const igDetails = await metaApi.makeRequest(
      `/${instagramAccountId}?fields=id,username,name,followers_count`,
      accessToken
    );
    
    console.log(`Instagram Account: ${igDetails.name} (@${igDetails.username})`);
    console.log(`Followers: ${igDetails.followers_count}`);
    
    // Update client with Instagram account ID
    await db
      .update(clients)
      .set({
        instagramAccountId: instagramAccountId
      })
      .where(eq(clients.id, 1));
    
    // Update Instagram metrics with real follower count
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Check if metric exists for this date and platform
      const existingMetric = await db
        .select()
        .from(metrics)
        .where(
          and(
            eq(metrics.clientId, 1),
            eq(metrics.platform, 'instagram'),
            eq(metrics.date, date)
          )
        )
        .limit(1);
      
      if (existingMetric.length > 0) {
        // Update existing metric
        await db
          .update(metrics)
          .set({
            followers: igDetails.followers_count
          })
          .where(eq(metrics.id, existingMetric[0].id));
      } else {
        // Insert new metric
        await db.insert(metrics).values({
          clientId: 1,
          platform: 'instagram',
          date,
          reach: 0,
          impressions: 0,
          engagement: 0,
          followers: igDetails.followers_count,
          likes: 0,
          comments: 0,
          shares: 0,
        });
      }
    }
    
    console.log('Instagram data updated successfully');
    
  } catch (error) {
    console.error('Error updating Instagram data:', error);
  }
}

updateInstagramData();