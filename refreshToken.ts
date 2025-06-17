import { db } from './db.js';
import { clients } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

async function refreshClientToken() {
  try {
    console.log('🔄 Updating client token...');
    
    // Use the latest token provided by user
    const newToken = 'EAAPgx92A9EEBO4CTOhNpLPIDXqZAqlZCroL0ZApADSNAk2SnoZAheGttR8ZB9AWukKMYHuZBwLlc5ksHiZApqCfgGY4zjZCMB16zttI04xjSST19rvci8eGwcvZC1xOaY6toOfDLDM2kIs0yIcN1hni6s0P7qjoyJnwzu1K8QFBXEhenLGH4LCCD7ZCxhHXrhVOiVtv6eqLASZAZBatEAl0YKN1AIMjzw0WqWTzZC';
    
    if (!newToken) {
      console.log('❌ No token provided');
      return;
    }

    // Update the client with the new token
    await db
      .update(clients)
      .set({
        metaAccessToken: newToken,
        instagramAccessToken: newToken
      })
      .where(eq(clients.id, 1));

    console.log('✅ Client token updated successfully');
    
    // Test the token by making a simple API call
    const testResponse = await fetch(`https://graph.facebook.com/v18.0/446365348569001?access_token=${newToken}`);
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('✅ Token validated successfully:', data.name);
    } else {
      const error = await testResponse.json();
      console.log('❌ Token validation failed:', error);
    }

  } catch (error) {
    console.error('❌ Error updating token:', error);
  }
}

refreshToken().catch(console.error);

async function refreshToken() {
  return refreshClientToken();
}