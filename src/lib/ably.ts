import Ably from "ably";

/**
 * Server-side Ably REST client. The API key never reaches the browser;
 * clients authenticate through /api/ably-token with scoped capabilities.
 */
function restClient(): Ably.Rest | null {
  const key = process.env.ABLY_API_KEY;
  if (!key) return null;
  return new Ably.Rest({ key });
}

export async function publishToChat(chatId: string, event: string, data: unknown) {
  const client = restClient();
  if (!client) return;
  await client.channels.get(`chat:${chatId}`).publish(event, data);
}

export async function publishToUser(userId: string, event: string, data: unknown) {
  const client = restClient();
  if (!client) return;
  await client.channels.get(`user:${userId}`).publish(event, data);
}
