import { metaApi } from "./metaApi";

async function testMetaConnection() {
  const accessToken = 'EAAOAE00gq0kBO42AVDNIE08s2GKsHE0tNEK20pfynY9XggsoZACdoaOMgEyYtsuhWtzbZAznp3bUkudLr3P21ZAzkJeXPhgO2ipA3AyZADvY8N6AggN1n6dmEahK8j3UvfXEEsfTltOeDbZBLZA8ZBfr2r4wZCjv2ZCrZAwZBvX2HAbLZBTZBlzcz2uoWAwhBYgYb994VwZC9Wul0UQZBWCXazl8XHok90ZD';
  const pageId = '61568207521829';

  try {
    console.log('Testing access token validity...');
    
    // Test basic token validity and permissions
    const tokenInfo = await metaApi.makeRequest('/me?fields=id,name', accessToken);
    console.log('Token Info:', JSON.stringify(tokenInfo, null, 2));

    console.log('Testing accessible pages...');
    
    // Get pages that this token can access
    const myPages = await metaApi.makeRequest('/me/accounts?fields=id,name,category,access_token', accessToken);
    console.log('My Pages:', JSON.stringify(myPages, null, 2));

    if (myPages.data && myPages.data.length > 0) {
      const firstPage = myPages.data[0];
      console.log(`Testing posts for page: ${firstPage.name} (${firstPage.id})`);
      
      // Use the page's own access token for better permissions
      const pageAccessToken = firstPage.access_token || accessToken;
      const pagePosts = await metaApi.makeRequest(`/${firstPage.id}/posts?fields=id,message,created_time,likes.limit(0).summary(true),comments.limit(0).summary(true)&limit=5`, pageAccessToken);
      console.log('Page Posts:', JSON.stringify(pagePosts, null, 2));
    }

  } catch (error) {
    console.error('API Test Error:', error);
  }
}

testMetaConnection();