import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const reminderInput = z.object({
  kind: z.enum(["stream", "video"]),
  target_id: z.string().min(1).max(200),
  title: z.string().max(300).default(""),
  href: z.string().max(500).default(""),
  poster_url: z.string().max(500).nullable().default(null),
  remind_at: z.string().max(60).nullable().default(null),
});

export const getMyReminders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("reminders")
      .select("id, kind, target_id, title, href, poster_url, remind_at, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const addReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => reminderInput.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("reminders").upsert(
      { ...data, user_id: context.userId, notified_at: null },
      { onConflict: "user_id,kind,target_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeReminder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ kind: z.enum(["stream", "video"]), target_id: z.string().min(1).max(200) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("reminders")
      .delete()
      .eq("kind", data.kind)
      .eq("target_id", data.target_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("notifications")
      .select("id, title, body, href, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const dismissNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1).max(100) }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("notifications").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Clear the inbox: everything, or only the ones already read. */
export const clearNotifications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ scope: z.enum(["all", "read"]).default("all") }).parse(data ?? {}),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("notifications").delete().eq("user_id", context.userId);
    if (data.scope === "read") q = q.not("read_at", "is", null);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });
