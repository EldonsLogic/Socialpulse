import { metaApi } from "./metaApi";

async function testRealDataFetch() {
  const accessToken = 'EAAOAE00gq0kBO42AVDNIE08s2GKsHE0tNEK20pfynY9XggsoZACdoaOMgEyYtsuhWtzbZAznp3bUkudLr3P21ZAzkJeXPhgO2ipA3AyZADvY8N6AggN1n6dmEahK8j3UvfXEEsfTltOeDbZBLZA8ZBfr2r4wZCjv2ZCrZAwZBvX2HAbLZBTZBlzcz2uoWAwhBYgYb994VwZC9Wul0UQZBWCXazl8XHok90ZD';
  const pageId = '446365348569001'; // Correct page ID

  try {
    console.log('Testing SplatSaudi page data fetch...');
    
    // First test basic page info
    const pageInfo = await metaApi.makeRequest(`/${pageId}?fields=id,name,category,fan_count`, accessToken);
    console.log('Page Info fetched successfully');
    console.log('Page name:', pageInfo.name);
    console.log('Fan count:', pageInfo.fan_count || 'N/A');

    // Test page posts
    const posts = await metaApi.makeRequest(`/${pageId}/posts?fields=id,message,created_time,likes.limit(0).summary(true),comments.limit(0).summary(true)&limit=10`, accessToken);
    console.log('Page Posts fetched successfully');
    console.log('Posts found:', posts.data?.length || 0);

    // Test simple insights metrics that are usually available
    try {
      const insights = await metaApi.makeRequest(`/${pageId}/insights?metric=page_views_total&period=day&limit=7`, accessToken);
      console.log('Page Insights fetched successfully');
      console.log('Insights data points:', insights.data?.length || 0);
    } catch (insightsError) {
      console.log('Page insights not available - this is normal for pages without sufficient data');
    }

    console.log('Real Meta data integration is working!');
    return true;

  } catch (error) {
    console.error('Meta API Test Error:', error);
    return false;
  }
}

testRealDataFetch();