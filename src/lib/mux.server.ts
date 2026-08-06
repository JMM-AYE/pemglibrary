/**
 * Mux Video live ingest. Creates the RTMP endpoint that vMix / OBS push into,
 * and hands back the HLS playback id the app plays.
 */

export const MUX_RTMP_URL = "rtmps://global-live.mux.com:443/app";

export type MuxLiveStream = {
  muxStreamId: string;
  streamKey: string;
  playbackId: string;
};

function auth() {
  const id = process.env["MUX_TOKEN_ID"];
  const secret = process.env["MUX_TOKEN_SECRET"];
  if (!id || !secret) {
    throw new Error(
      "Mux is not connected yet. Add the Mux access token id and secret to enable RTMP broadcasting.",
    );
  }
  return `Basic ${btoa(`${id}:${secret}`)}`;
}

export async function createMuxLiveStream(reference: string): Promise<MuxLiveStream> {
  const response = await fetch("https://api.mux.com/video/v1/live-streams", {
    method: "POST",
    headers: { authorization: auth(), "content-type": "application/json" },
    body: JSON.stringify({
      playback_policy: ["public"],
      latency_mode: "low",
      reconnect_window: 60,
      new_asset_settings: { playback_policy: ["public"] },
      passthrough: reference.slice(0, 255),
    }),
  });
  const payload = (await response.json()) as {
    data?: { id: string; stream_key: string; playback_ids?: { id: string }[] };
    error?: { messages?: string[] };
  };
  if (!response.ok || !payload.data) {
    throw new Error(payload.error?.messages?.join(", ") ?? "Mux rejected the request");
  }
  const playbackId = payload.data.playback_ids?.[0]?.id;
  if (!playbackId) throw new Error("Mux did not return a playback id");
  return { muxStreamId: payload.data.id, streamKey: payload.data.stream_key, playbackId };
}

export async function deleteMuxLiveStream(muxStreamId: string) {
  await fetch(`https://api.mux.com/video/v1/live-streams/${muxStreamId}`, {
    method: "DELETE",
    headers: { authorization: auth() },
  }).catch(() => undefined);
}

export function muxPlaybackUrl(playbackId: string) {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}