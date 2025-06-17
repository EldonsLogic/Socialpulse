import { metaApi } from "./metaApi";

async function getInstagramBusinessAccountId() {
  const accessToken = 'EAAOAE00gq0kBO42AVDNIE08s2GKsHE0tNEK20pfynY9XggsoZACdoaOMgEyYtsuhWtzbZAznp3bUkudLr3P21ZAzkJeXPhgO2ipA3AyZADvY8N6AggN1n6dmEahK8j3UvfXEEsfTltOeDbZBLZA8ZBfr2r4wZCjv2ZCrZAwZBvX2HAbLZBTZBlzcz2uoWAwhBYgYb994VwZC9Wul0UQZBWCXazl8XHok90ZD';
  const pageId = '446365348569001';

  try {
    console.log('Looking for Instagram Business Account linked to your Facebook page...');
    
    // Get Instagram account linked to the Facebook page
    const instagramAccount = await metaApi.makeRequest(
      `/${pageId}?fields=instagram_business_account`,
      accessToken
    );
    
    if (instagramAccount.instagram_business_account) {
      const igAccountId = instagramAccount.instagram_business_account.id;
      console.log('Instagram Business Account ID found:', igAccountId);
      
      // Get Instagram account details
      const igDetails = await metaApi.makeRequest(
        `/${igAccountId}?fields=id,username,name,followers_count`,
        accessToken
      );
      
      console.log('Instagram Account Details:');
      console.log('- ID:', igDetails.id);
      console.log('- Username:', igDetails.username);
      console.log('- Name:', igDetails.name);
      console.log('- Followers:', igDetails.followers_count);
      
      return igAccountId;
    } else {
      console.log('No Instagram Business Account linked to this Facebook page');
      console.log('To link Instagram:');
      console.log('1. Convert your Instagram to a Business Account');
      console.log('2. Link it to your Facebook page in Instagram settings');
      return null;
    }
    
  } catch (error) {
    console.error('Error getting Instagram account:', error);
    return null;
  }
}

getInstagramBusinessAccountId();