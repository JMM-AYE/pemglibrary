import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Pulls the meeting id + passcode out of any Zoom join URL (or a bare id). */
export function parseZoomLink(value: string) {
  const raw = value.trim();
  const digits = raw.replace(/\D/g, "");
  if (/^\d{9,12}$/.test(raw.replace(/\s/g, ""))) {
    return { meetingNumber: raw.replace(/\s/g, ""), password: "" };
  }
  try {
    const url = new URL(raw);
    const match = url.pathname.match(/\/(?:j|wc|s)\/(\d{9,12})/);
    return {
      meetingNumber: match?.[1] ?? "",
      password: url.searchParams.get("pwd") ?? "",
    };
  } catch {
    return { meetingNumber: digits.length >= 9 ? digits : "", password: "" };
  }
}

function base64url(bytes: Uint8Array) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signMeetingSdkJwt(sdkKey: string, sdkSecret: string, meetingNumber: string) {
  const iat = Math.floor(Date.now() / 1000) - 30;
  const exp = iat + 60 * 60 * 2;
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    appKey: sdkKey,
    sdkKey,
    mn: meetingNumber,
    role: 0, // attendee
    iat,
    exp,
    tokenExp: exp,
  };
  const enc = new TextEncoder();
  const unsigned = `${base64url(enc.encode(JSON.stringify(header)))}.${base64url(
    enc.encode(JSON.stringify(payload)),
  )}`;
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(sdkSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(unsigned));
  return `${unsigned}.${base64url(new Uint8Array(sig))}`;
}

/**
 * Confirms the viewer may watch this session, then hands back everything the
 * embedded Zoom client needs. Falls back to the plain join link when no Zoom
 * Meeting SDK credentials are configured.
 */
export const getZoomJoinConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        slug: z.string().min(1).max(120),
        code: z.string().max(60).default(""),
        token: z.string().max(80).default(""),
      })
      .parse(data),
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
      .select("source_type, source_value, access_code, private_token")
      .eq("stream_id", stream.id)
      .maybeSingle();
    if (!source || source.source_type !== "zoom" || !source.source_value) {
      return { ok: false as const, reason: "not-ready" as const };
    }
    if (stream.visibility === "code") {
      const expectedToken = (source.private_token ?? "").trim();
      const expectedCode = (source.access_code ?? "").trim().toLowerCase();
      const tokenOk = expectedToken.length > 0 && expectedToken === data.token.trim();
      const codeOk = expectedCode.length > 0 && expectedCode === data.code.trim().toLowerCase();
      if (!tokenOk && !codeOk) return { ok: false as const, reason: "code" as const };
    }

    const { meetingNumber, password } = parseZoomLink(source.source_value);
    const sdkKey = process.env["ZOOM_SDK_KEY"] ?? "";
    const sdkSecret = process.env["ZOOM_SDK_SECRET"] ?? "";

    if (!sdkKey || !sdkSecret || !meetingNumber) {
      return {
        ok: true as const,
        embeddable: false as const,
        joinUrl: source.source_value,
      };
    }

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", context.userId)
      .maybeSingle();

    return {
      ok: true as const,
      embeddable: true as const,
      joinUrl: source.source_value,
      sdkKey,
      signature: await signMeetingSdkJwt(sdkKey, sdkSecret, meetingNumber),
      meetingNumber,
      password,
      userName: profile?.full_name?.trim() || "PEMG Library guest",
      userEmail: profile?.email ?? "",
    };
  });
