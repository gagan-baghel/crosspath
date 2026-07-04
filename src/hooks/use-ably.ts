"use client";

import Ably from "ably";
import { useEffect, useState } from "react";

let sharedClient: Ably.Realtime | null = null;
// Cached probe result so we only check the token endpoint once per load.
let configuredProbe: Promise<boolean> | null = null;

function isRealtimeConfigured(): Promise<boolean> {
  if (!configuredProbe) {
    configuredProbe = fetch("/api/ably-token")
      .then((res) => res.ok)
      .catch(() => false);
  }
  return configuredProbe;
}

function getAblyClient(): Ably.Realtime {
  if (!sharedClient) {
    // authCallback (not authUrl) avoids Ably v2's relative-URL handling,
    // which rejects a leading-slash path with a `prefixUrl` error.
    sharedClient = new Ably.Realtime({
      authCallback: async (_params, callback) => {
        try {
          const res = await fetch("/api/ably-token");
          if (!res.ok) {
            callback(`Token request failed: ${res.status}`, null);
            return;
          }
          const tokenRequest = await res.json();
          callback(null, tokenRequest);
        } catch (err) {
          callback(err instanceof Error ? err.message : "Token request failed", null);
        }
      },
      autoConnect: true,
      closeOnUnload: true,
    });
  }
  return sharedClient;
}

/**
 * Returns a connected Ably client, or null when realtime isn't configured
 * (no ABLY_API_KEY). Returning null lets the chat degrade gracefully —
 * messages still persist and load from the database — instead of spamming
 * the token endpoint with failed retries.
 *
 * When `refreshAuth` is set, forces a token refresh so channels created
 * since the last token (e.g. a chat opened seconds ago) are authorized.
 */
export function useAblyClient(refreshAuth = false): Ably.Realtime | null {
  const [client, setClient] = useState<Ably.Realtime | null>(null);

  useEffect(() => {
    let cancelled = false;
    isRealtimeConfigured().then((ok) => {
      if (cancelled || !ok) return;
      const c = getAblyClient();
      if (refreshAuth) c.auth.authorize().catch(() => {});
      setClient(c);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshAuth]);

  return client;
}
