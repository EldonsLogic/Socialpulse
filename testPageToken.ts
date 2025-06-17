import { metaApi } from "./metaApi";

async function testPageToken() {
  const pageAccessToken = 'EAAOAE00gq0kBO4nwAofTYXQ0cUGVKZBgBR9ITyPuPaM8Y1LJmiZAWZBe42xe7ondC3EWyDiuSZBcng3UdQl9m1Oyr0Pfz15DvUa1TSebjzdpVaRgMuRkiXZA65qZBVdZA5CzZC0lhDYap3surSR0r49yTXgQJ9ZAHv8HdPWn04xs4wYtOZBqOjFl5350My12WXkSoZD';
  const pageId = '446365348569001';
  const instagramAccountId = '17841469850045553';

  try {
    console.log('Testing Page Access Token...');
    
    // Test Facebook page info
    const pageInfo = await metaApi.makeRequest(
      `/${pageId}?fields=id,name,category,fan_count`,
      pageAccessToken
    );
    
    console.log('Facebook Page Info:');
    console.log('- Name:', pageInfo.name);
    console.log('- Fans:', pageInfo.fan_count);
    
    // Test Facebook page insights
    const pageInsights = await metaApi.getPageInsights(
      pageId,
      pageAccessToken,
      ['page_impressions', 'page_reach', 'page_engaged_users'],
      '2025-05-28',
      '2025-06-04'
    );
    
    console.log('Facebook Insights:', pageInsights.data.length, 'metrics found');
    
    // Test Instagram account info
    const igInfo = await metaApi.makeRequest(
      `/${instagramAccountId}?fields=id,username,name,followers_count`,
      pageAccessToken
    );
    
    console.log('Instagram Account Info:');
    console.log('- Username:', igInfo.username);
    console.log('- Followers:', igInfo.followers_count);
    
    // Test Instagram insights
    const igInsights = await metaApi.getInstagramInsights(
      instagramAccountId,
      pageAccessToken,
      ['impressions', 'reach', 'profile_views'],
      'day',
      '2025-05-28',
      '2025-06-04'
    );
    
    console.log('Instagram Insights:', igInsights.data.length, 'metrics found');
    
    console.log('✅ Page Access Token is working correctly!');
    
  } catch (error) {
    console.error('❌ Page Access Token test failed:', error);
  }
}

testPageToken();