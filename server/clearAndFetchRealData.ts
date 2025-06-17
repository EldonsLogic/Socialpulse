import { db } from "./db";
import { metrics, posts } from "@shared/schema";
import { metaApi } from "./metaApi";

async function clearSampleDataAndFetchReal() {
  try {
    console.log('Clearing sample data...');
    
    // Clear existing sample data
    await db.delete(metrics);
    await db.delete(posts);
    
    console.log('Fetching real Facebook page data...');
    
    const accessToken = 'EAAOAE00gq0kBO42AVDNIE08s2GKsHE0tNEK20pfynY9XggsoZACdoaOMgEyYtsuhWtzbZAznp3bUkudLr3P21ZAzkJeXPhgO2ipA3AyZADvY8N6AggN1n6dmEahK8j3UvfXEEsfTltOeDbZBLZA8ZBfr2r4wZCjv2ZCrZAwZBvX2HAbLZBTZBlzcz2uoWAwhBYgYb994VwZC9Wul0UQZBWCXazl8XHok90ZD';
    const pageId = '580698925134619';
    const clientId = 1;
    
    // Get page info
    const pageInfo = await metaApi.makeRequest(
      `/${pageId}?fields=id,name,category,fan_count`,
      accessToken
    );
    
    console.log(`Page: ${pageInfo.name}, Fans: ${pageInfo.fan_count || 0}`);
    
    // Create real metrics for the last 7 days
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Create Meta metrics with real page data
      await db.insert(metrics).values({
        clientId,
        platform: 'meta',
        date,
        reach: 0,
        impressions: 0,
        engagement: 0,
        followers: pageInfo.fan_count || 0,
        likes: 0,
        comments: 0,
        shares: 0,
      });
      
      // Create Instagram placeholder (until we get real Instagram Business ID)
      await db.insert(metrics).values({
        clientId,
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
    
    // Fetch real posts
    const postsData = await metaApi.makeRequest(
      `/${pageId}/posts?fields=id,message,created_time,likes.limit(0).summary(true),comments.limit(0).summary(true)&limit=10`,
      accessToken
    );
    
    if (postsData.data && postsData.data.length > 0) {
      for (const post of postsData.data) {
        await db.insert(posts).values({
          clientId,
          platform: 'meta',
          externalId: post.id,
          content: post.message || 'No content available',
          imageUrl: null,
          publishedAt: new Date(post.created_time),
          likes: post.likes?.summary?.total_count || 0,
          comments: post.comments?.summary?.total_count || 0,
          shares: 0,
          reach: 0,
          impressions: 0,
          engagementRate: 0,
        });
      }
      console.log(`Added ${postsData.data.length} real posts`);
    } else {
      console.log('No posts found on the page');
    }
    
    console.log('Real Facebook data integration complete!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

clearSampleDataAndFetchReal();