import { db } from "./db";
import { clients } from "@shared/schema";
import { eq } from "drizzle-orm";

async function updatePageToken() {
  try {
    const pageAccessToken = 'EAAOAE00gq0kBO4nwAofTYXQ0cUGVKZBgBR9ITyPuPaM8Y1LJmiZAWZBe42xe7ondC3EWyDiuSZBcng3UdQl9m1Oyr0Pfz15DvUa1TSebjzdpVaRgMuRkiXZA65qZBVdZA5CzZC0lhDYap3surSR0r49yTXgQJ9ZAHv8HdPWn04xs4wYtOZBqOjFl5350My12WXkSoZD';
    
    console.log('Updating client with Page Access Token...');
    
    const result = await db
      .update(clients)
      .set({
        metaAccessToken: pageAccessToken,
        instagramAccessToken: pageAccessToken,
      })
      .where(eq(clients.id, 1))
      .returning();
    
    console.log('Page Access Token updated for:', result[0].name);
    
  } catch (error) {
    console.error('Error updating token:', error);
  }
}

updatePageToken();