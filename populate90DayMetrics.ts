import { db } from './db.js';
import { metrics } from '../shared/schema.js';

async function populate90DayMetrics() {
  try {
    console.log('📊 Generating 90 days of comprehensive metrics data...');
    
    const today = new Date();
    const metricsData = [];
    
    // Generate 90 days of data
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create realistic variation over time with trends
      const daysSinceStart = 90 - i;
      const growthFactor = 1 + (daysSinceStart * 0.002); // Gradual growth
      const randomVariation = 0.8 + (Math.random() * 0.4); // ±20% daily variation
      const weeklyPattern = 1 + Math.sin((daysSinceStart / 7) * Math.PI * 2) * 0.1; // Weekly patterns
      
      const multiplier = growthFactor * randomVariation * weeklyPattern;
      
      // Facebook/Meta baseline metrics with growth
      const metaBaseline = {
        reach: Math.floor(400000 * multiplier),
        impressions: Math.floor(7000000 * multiplier),
        engagement: Math.floor(10500 * multiplier),
        followers: 74200 + Math.floor(daysSinceStart * 15), // Steady growth
        likes: Math.floor(7100 * multiplier),
        comments: Math.floor(2140 * multiplier),
        shares: Math.floor(1240 * multiplier)
      };
      
      // Instagram baseline metrics with growth
      const instagramBaseline = {
        reach: Math.floor(340000 * multiplier),
        impressions: Math.floor(1780000 * multiplier),
        engagement: Math.floor(5565 * multiplier),
        followers: 31240 + Math.floor(daysSinceStart * 8), // Steady growth
        likes: Math.floor(3895 * multiplier),
        comments: Math.floor(1113 * multiplier),
        shares: Math.floor(557 * multiplier)
      };
      
      // Insert Meta metrics
      metricsData.push({
        clientId: 1,
        platform: 'meta',
        date: date,
        reach: metaBaseline.reach,
        impressions: metaBaseline.impressions,
        engagement: metaBaseline.engagement,
        followers: metaBaseline.followers,
        likes: metaBaseline.likes,
        comments: metaBaseline.comments,
        shares: metaBaseline.shares
      });
      
      // Insert Instagram metrics
      metricsData.push({
        clientId: 1,
        platform: 'instagram',
        date: date,
        reach: instagramBaseline.reach,
        impressions: instagramBaseline.impressions,
        engagement: instagramBaseline.engagement,
        followers: instagramBaseline.followers,
        likes: instagramBaseline.likes,
        comments: instagramBaseline.comments,
        shares: instagramBaseline.shares
      });
    }
    
    // Batch insert all metrics
    console.log(`📊 Inserting ${metricsData.length} metric records...`);
    
    for (const metric of metricsData) {
      await db.insert(metrics).values(metric);
    }
    
    console.log('✅ Successfully generated 90 days of comprehensive metrics data');
    console.log('📈 Data includes realistic growth trends and daily variations');
    console.log('🎯 All time frame selectors (7D, 30D, 90D, Custom) now have full data support');
    
  } catch (error) {
    console.error('❌ Error generating metrics data:', error);
  }
}

populate90DayMetrics().catch(console.error);