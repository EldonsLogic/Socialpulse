import { db } from "./db";
import { clients } from "@shared/schema";
import { metaApi } from "./metaApi";
import { eq } from "drizzle-orm";

async function syncClientNameWithPageName() {
  try {
    const accessToken = 'EAAOAE00gq0kBO42AVDNIE08s2GKsHE0tNEK20pfynY9XggsoZACdoaOMgEyYtsuhWtzbZAznp3bUkudLr3P21ZAzkJeXPhgO2ipA3AyZADvY8N6AggN1n6dmEahK8j3UvfXEEsfTltOeDbZBLZA8ZBfr2r4wZCjv2ZCrZAwZBvX2HAbLZBTZBlzcz2uoWAwhBYgYb994VwZC9Wul0UQZBWCXazl8XHok90ZD';
    const pageId = '580698925134619';
    
    // Get the actual page name from Facebook
    const pageInfo = await metaApi.makeRequest(
      `/${pageId}?fields=id,name,category,fan_count`,
      accessToken
    );
    
    // Update client name to match the Facebook page name
    const [updatedClient] = await db
      .update(clients)
      .set({
        name: pageInfo.name
      })
      .where(eq(clients.id, 1))
      .returning();
    
    console.log(`Client name updated to: ${pageInfo.name}`);
    return updatedClient;
    
  } catch (error) {
    console.error('Error syncing page name:', error);
    throw error;
  }
}

syncClientNameWithPageName();