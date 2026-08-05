import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createPublicClient } from "./events.server";

const PUBLIC_COLUMNS =
  "id, slug, title, summary, status, visibility, starts_at, poster_url, published";

const streamInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  summary: z.string().max(2000).default(""),
  status: z.enum(["scheduled", "live", "ended"]).default("scheduled"),
  visibility: z.enum(["public", "code"]).default("public"),
  starts_at: z.string().min(1),
  poster_url: z.string().max(500).nullable().default(null),
  published: z.boolean().default(true),
  source_type: z.enum(["youtube", "hls"]).default("youtube"),
  source_value: z.string().max(1000).default(""),
  access_code: z.string().max(60).default(""),
});

/** Published streams — metadata only, never the playback source or code. */
export const getPublicStreams = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("live_streams")
    .select(PUBLIC_COLUMNS)
    .eq("published", true)
    .order("starts_at", { ascending: false });
  return data ?? [];
});

export const getPublicStream = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(data))
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: stream } = await supabase
      .from("live_streams")
      .select(PUBLIC_COLUMNS)
      .eq("published", true)
      .eq("slug", data.slug)
      .maybeSingle();
    return stream;
  });

/**
 * Hands back the actual playback source. Requires a signed-in account, and an
 * invite code when the session is private. The source never reaches the
 * browser until both checks pass.
 */
export const getStreamPlayback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ slug: z.string().min(1).max(120), code: z.string().max(60).default("") }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: stream } = await context.supabase
      .from("live_streams")
      .select("id, visibility, published")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!stream || !stream.published) return { ok: false as const, reason: "missing" as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: source } = await supabaseAdmin
      .from("live_stream_sources")
      .select("source_type, source_value, access_code")
      .eq("stream_id", stream.id)
      .maybeSingle();

    if (!source || !source.source_value) {
      return { ok: false as const, reason: "not-ready" as const };
    }
    if (stream.visibility === "code") {
      const expected = (source.access_code ?? "").trim().toLowerCase();
      if (!expected || expected !== data.code.trim().toLowerCase()) {
        return { ok: false as const, reason: "code" as const };
      }
    }
    return {
      ok: true as const,
      sourceType: source.source_type as "youtube" | "hls",
      sourceValue: source.source_value,
    };
  });

async function assertAdmin(context: { supabase: ReturnType<typeof createPublicClient>; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Forbidden: admin access required");
}

export const getAllStreams = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("live_streams")
      .select(`${PUBLIC_COLUMNS}, live_stream_sources(source_type, source_value, access_code)`)
      .order("starts_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => {
      const { live_stream_sources: sources, ...stream } = row as typeof row & {
        live_stream_sources: {
          source_type: string;
          source_value: string;
          access_code: string | null;
        } | null;
      };
      return {
        ...stream,
        source_type: (sources?.source_type ?? "youtube") as "youtube" | "hls",
        source_value: sources?.source_value ?? "",
        access_code: sources?.access_code ?? "",
      };
    });
  });

export const saveStream = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => streamInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, source_type, source_value, access_code, ...fields } = data;

    let streamId = id;
    let previousStatus: string | null = null;

    if (streamId) {
      const { data: before } = await supabaseAdmin
        .from("live_streams")
        .select("status")
        .eq("id", streamId)
        .maybeSingle();
      previousStatus = before?.status ?? null;
      const { error } = await supabaseAdmin.from("live_streams").update(fields).eq("id", streamId);
      if (error) throw new Error(error.message);
    } else {
      const { data: created, error } = await supabaseAdmin
        .from("live_streams")
        .insert(fields)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      streamId = created.id;
    }

    const { error: sourceError } = await supabaseAdmin.from("live_stream_sources").upsert(
      {
        stream_id: streamId!,
        source_type,
        source_value,
        access_code: access_code || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stream_id" },
    );
    if (sourceError) throw new Error(sourceError.message);

    if (fields.status === "live" && previousStatus !== "live") {
      await notifySubscribers(fields.slug, fields.title);
    }
    return { ok: true };
  });

export const deleteStream = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("live_streams").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Drops an in-app notification for everyone who asked to be told about this stream. */
async function notifySubscribers(slug: string, title: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: reminders } = await supabaseAdmin
    .from("reminders")
    .select("user_id")
    .eq("kind", "stream")
    .eq("target_id", slug);
  if (!reminders?.length) return;
  await supabaseAdmin.from("notifications").insert(
    reminders.map((r) => ({
      user_id: r.user_id,
      title: `${title} is live now`,
      body: "Pastor Enoch has just gone live. Tap to join the session.",
      href: `/live/${slug}`,
    })),
  );
  await supabaseAdmin
    .from("reminders")
    .update({ notified_at: new Date().toISOString() })
    .eq("kind", "stream")
    .eq("target_id", slug);
}