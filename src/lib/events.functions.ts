import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createPublicClient } from "./events.server";

const COLUMNS = "id, slug, title, kind, starts_at, location, summary, cta, href, image_url, published";

const eventInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  kind: z.string().min(1).max(80),
  starts_at: z.string().min(1),
  location: z.string().max(200).default(""),
  summary: z.string().max(2000).default(""),
  cta: z.string().max(80).default("Find out more"),
  href: z.string().max(500).default(""),
  image_url: z.string().max(500).nullable().default(null),
  published: z.boolean().default(true),
});

/** Public, published events only — safe for SSR and anonymous visitors. */
export const getPublicEvents = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("events")
    .select(COLUMNS)
    .eq("published", true)
    .order("starts_at", { ascending: true });
  return data ?? [];
});

/** A single published event by slug — public detail page. */
export const getPublicEvent = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(data))
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: event } = await supabase
      .from("events")
      .select(COLUMNS)
      .eq("published", true)
      .eq("slug", data.slug)
      .maybeSingle();
    return event;
  });

async function assertAdmin(context: { supabase: ReturnType<typeof createPublicClient>; userId: string }) {
  const { data } = await context.supabase.rpc("is_admin");
  if (!data) throw new Error("Forbidden: admin access required");
}

export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("is_admin");
    return Boolean(data);
  });

export const getAllEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("events")
      .select(COLUMNS)
      .order("starts_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => eventInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...fields } = data;
    const query = id
      ? context.supabase.from("events").update(fields).eq("id", id)
      : context.supabase.from("events").insert(fields);
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
