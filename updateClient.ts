import { db } from "./db";
import { clients } from "@shared/schema";
import { eq } from "drizzle-orm";

async function updateClientWithRealCredentials() {
  try {
    const [client] = await db
      .update(clients)
      .set({
        name: 'SplatSaudi',
        metaAccessToken: 'EAAOAE00gq0kBO42AVDNIE08s2GKsHE0tNEK20pfynY9XggsoZACdoaOMgEyYtsuhWtzbZAznp3bUkudLr3P21ZAzkJeXPhgO2ipA3AyZADvY8N6AggN1n6dmEahK8j3UvfXEEsfTltOeDbZBLZA8ZBfr2r4wZCjv2ZCrZAwZBvX2HAbLZBTZBlzcz2uoWAwhBYgYb994VwZC9Wul0UQZBWCXazl8XHok90ZD',
        instagramAccessToken: 'EAAOAE00gq0kBO42AVDNIE08s2GKsHE0tNEK20pfynY9XggsoZACdoaOMgEyYtsuhWtzbZAznp3bUkudLr3P21ZAzkJeXPhgO2ipA3AyZADvY8N6AggN1n6dmEahK8j3UvfXEEsfTltOeDbZBLZA8ZBfr2r4wZCjv2ZCrZAwZBvX2HAbLZBTZBlzcz2uoWAwhBYgYb994VwZC9Wul0UQZBWCXazl8XHok90ZD',
        metaPageId: '446365348569001',
        instagramAccountId: '17841469850045553'
      })
      .where(eq(clients.id, 1))
      .returning();
    
    console.log('✅ Client updated with real Meta credentials:', client.name);
    return client;
  } catch (error) {
    console.error('❌ Error updating client:', error);
    throw error;
  }
}

updateClientWithRealCredentials();