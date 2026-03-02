import { neon } from "@neondatabase/serverless";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export interface Usage {
  scanCount: number;
  hasSubscription: boolean;
}

export async function getUsage(sessionId: string): Promise<Usage | null> {
  const sql = getSql();
  if (!sql) return null;

  try {
    const rows = await sql`
      select scan_count, subscription_valid_until
      from sessions
      where id = ${sessionId}
      limit 1
    `;
    const row = rows[0] as
      | { scan_count: number; subscription_valid_until: Date | null }
      | undefined;
    if (!row) return { scanCount: 0, hasSubscription: false };

    const hasSubscription =
      row.subscription_valid_until != null &&
      new Date(row.subscription_valid_until) > new Date();

    return {
      scanCount: Number(row.scan_count) || 0,
      hasSubscription,
    };
  } catch {
    return null;
  }
}

export async function getOrCreateAndIncrementScan(
  sessionId: string
): Promise<{ scanCount: number }> {
  const sql = getSql();
  if (!sql) return { scanCount: 0 };

  try {
    await sql`
      insert into sessions (id, scan_count)
      values (${sessionId}, 1)
      on conflict (id) do update
      set scan_count = sessions.scan_count + 1
    `;
    const rows = await sql`
      select scan_count from sessions where id = ${sessionId} limit 1
    `;
    const row = rows[0] as { scan_count: number } | undefined;
    return { scanCount: row ? Number(row.scan_count) : 1 };
  } catch {
    return { scanCount: 0 };
  }
}

export async function setSubscriptionValidUntil(
  sessionId: string,
  validUntil: Date
): Promise<void> {
  const sql = getSql();
  if (!sql) return;

  try {
    await sql`
      insert into sessions (id, scan_count, subscription_valid_until)
      values (${sessionId}, 0, ${validUntil.toISOString()})
      on conflict (id) do update
      set subscription_valid_until = ${validUntil.toISOString()}
    `;
  } catch (e) {
    console.error("setSubscriptionValidUntil error:", e);
  }
}
