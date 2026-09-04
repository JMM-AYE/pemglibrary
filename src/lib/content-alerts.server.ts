/**
 * Fans out an in-app notification to every registered account, once per piece
 * of content. `notified_content` keeps the "already told them" ledger.
 */
import { fetchLibrarySermons } from "./youtube.server";
import { PEMG_CHANNEL_IDS } from "./youtube-types";

const MAX_AGE_DAYS = 7;

export async function notifyNewVideos() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { sermons } = await fetchLibrarySermons(PEMG_CHANNEL_IDS);
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

  const fresh = sermons
    .filter((s) => {
      const t = Date.parse(s.date);
      return Number.isFinite(t) && t >= cutoff;
    })
    .slice(0, 5);

  const { data: seen } = await supabaseAdmin
    .from("notified_content")
    .select("ref_id")
    .eq("kind", "video");
  const known = new Set((seen ?? []).map((r) => r.ref_id));

  // First run on a fresh install: record everything without alerting anyone.
  const bootstrapping = known.size === 0;
  const pending = fresh.filter((s) => !known.has(s.videoId));
  if (pending.length === 0) return { notified: 0, videos: 0 };

  if (!bootstrapping) {
    const { data: people } = await supabaseAdmin.from("profiles").select("id");
    const rows = (people ?? []).flatMap((p) =>
      pending.map((s) => ({
        user_id: p.id,
        title: `New message: ${s.title}`,
        body: "A new message has just been added to the library.",
        href: `/messages/${s.slug}`,
      })),
    );
    for (let i = 0; i < rows.length; i += 500) {
      await supabaseAdmin.from("notifications").insert(rows.slice(i, i + 500));
    }
  }

  await supabaseAdmin
    .from("notified_content")
    .upsert(
      pending.map((s) => ({ kind: "video", ref_id: s.videoId })),
      { onConflict: "kind,ref_id", ignoreDuplicates: true },
    );

  return { notified: bootstrapping ? 0 : pending.length, videos: pending.length };
}