import { db } from "./db";
import { clients } from "@shared/schema";
import { eq } from "drizzle-orm";

async function fixClientName() {
  try {
    console.log('Updating client name to correct page name...');
    
    const result = await db
      .update(clients)
      .set({
        name: 'Madinat Al Ward - مدينة الورد'
      })
      .where(eq(clients.id, 1))
      .returning();
    
    console.log('Client name updated:', result[0].name);
    
  } catch (error) {
    console.error('Error updating client name:', error);
  }
}

fixClientName();