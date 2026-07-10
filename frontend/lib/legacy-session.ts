import { legacyUrl } from "@/lib/platform";

export type LegacyBridgeSessionPayload = {
  status?: number;
  data?: { roles?: unknown } | null;
};

/**
 * Low-level fetch of the legacy Laravel bridge's current session for a given
 * Cookie header. Returns null on any network failure or non-2xx response -
 * callers decide what "no session" or "not admin" means for their context.
 */
export async function fetchLegacyBridgeSession(cookieHeader: string): Promise<LegacyBridgeSessionPayload | null> {
  try {
    const response = await fetch(legacyUrl("/bridge/v1/session"), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as LegacyBridgeSessionPayload;
  } catch {
    return null;
  }
}
