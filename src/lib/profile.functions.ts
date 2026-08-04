import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const profileInput = z.object({
  full_name: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(80),
  country_code: z.string().trim().min(1).max(8),
  phone: z.string().trim().min(4).max(24),
  attendee_type: z.enum(["member", "guest"]),
  cell_group: z.string().trim().max(120).default(""),
});

export type ProfileInput = z.infer<typeof profileInput>;

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, full_name, email, country, country_code, phone, attendee_type, cell_group")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => profileInput.parse(data))
  .handler(async ({ data, context }) => {
    const email = (context.claims["email"] as string | undefined) ?? "";
    const { error } = await context.supabase.from("profiles").upsert(
      {
        id: context.userId,
        email,
        ...data,
        cell_group: data.attendee_type === "member" ? data.cell_group : "",
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });