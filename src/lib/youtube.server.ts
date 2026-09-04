import type { Sermon } from "./youtube-types";

const FEED = "https://www.youtube.com/feeds/videos.xml?";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

function pick(block: string, re: RegExp) {
  const m = block.match(re);
  return m ? m[1] : "";
}

function decode(s: string) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

/** Unescapes the JSON-ish string literals embedded in YouTube's HTML payload. */
function unescapeJsonish(s: string) {
  try {
    return JSON.parse(`"${s}"`) as string;
  } catch {
    return s;
  }
}

const SERIES_HINT =
  /service|praise|conference|convention|fast|prayer|study|encounter|night|hour|program|summit|camp/i;
const DATE_LIKE = /^(\d|day\b|week\b)/i;

function seriesFrom(parts: string[]) {
  const tagged = parts.slice(1).find((p) => SERIES_HINT.test(p) && !DATE_LIKE.test(p));
  if (tagged) return tagged;
  if (SERIES_HINT.test(parts[0] ?? "")) return "Services";
  return "Messages";
}

function parseFeed(xml: string, series?: string): Sermon[] {
  const entries = xml.split("<entry>").slice(1);
  return entries.map((entry) => {
    const id = pick(entry, /<yt:videoId>([^<]+)<\/yt:videoId>/);
    const rawTitle = decode(pick(entry, /<title>([\s\S]*?)<\/title>/));
    const description = decode(pick(entry, /<media:description>([\s\S]*?)<\/media:description>/));
    const views = pick(entry, /<media:statistics views="(\d+)"/);
    const parts = rawTitle.split("||").map((p) => p.trim()).filter(Boolean);

    return {
      slug: id,
      videoId: id,
      title: parts[0] || rawTitle,
      series: series || seriesFrom(parts),
      date: pick(entry, /<published>([^<]+)<\/published>/),
      summary: description || rawTitle,
      cover: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      coverFallback: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      views: views ? Number(views) : null,
      url: `https://www.youtube.com/watch?v=${id}`,
    } satisfies Sermon;
  });
}

export type Playlist = { id: string; title: string };

/** Reads the channel's public playlists page and pulls out playlist names + ids. */
export async function fetchChannelPlaylists(channelId: string): Promise<Playlist[]> {
  const res = await fetch(
    `https://www.youtube.com/channel/${encodeURIComponent(channelId)}/playlists?hl=en`,
    { headers: { "user-agent": UA, "accept-language": "en" } },
  );
  if (!res.ok) {
    console.error(`YouTube playlists page failed [${res.status}]`);
    return [];
  }
  const html = await res.text();
  const re =
    /"lockupMetadataViewModel":\{"title":\{"content":"((?:[^"\\]|\\.)*)"[\s\S]{0,3000}?"contentId":"(PL[^"]+)","contentType":"LOCKUP_CONTENT_TYPE_PLAYLIST"/g;
  const seen = new Map<string, string>();
  for (const m of html.matchAll(re)) {
    if (!seen.has(m[2])) seen.set(m[2], unescapeJsonish(m[1]).trim());
  }
  return [...seen].map(([id, title]) => ({ id, title }));
}

async function fetchFeed(query: string, series?: string): Promise<Sermon[]> {
  const res = await fetch(`${FEED}${query}`, {
    headers: { accept: "application/atom+xml", "user-agent": UA },
  });
  if (!res.ok) {
    console.error(`YouTube feed request failed [${res.status}] for ${query}`);
    return [];
  }
  return parseFeed(await res.text(), series);
}

/**
 * Builds the library from the channel feed plus every public playlist, so the
 * playlist name becomes the series category shown in the UI.
 */
export async function fetchChannelSermons(channelId: string) {
  const playlists = await fetchChannelPlaylists(channelId);

  const [channelSermons, ...playlistResults] = await Promise.all([
    fetchFeed(`channel_id=${encodeURIComponent(channelId)}`),
    ...playlists.map((p) => fetchFeed(`playlist_id=${encodeURIComponent(p.id)}`, p.title)),
  ]);

  const byId = new Map<string, Sermon>();
  // Playlist entries first so their series name wins over the title heuristic.
  for (const sermon of playlistResults.flat()) {
    if (sermon.videoId && !byId.has(sermon.videoId)) byId.set(sermon.videoId, sermon);
  }
  for (const sermon of channelSermons) {
    if (!sermon.videoId) continue;
    const existing = byId.get(sermon.videoId);
    if (existing) byId.set(sermon.videoId, { ...sermon, series: existing.series });
    else byId.set(sermon.videoId, sermon);
  }

  const sermons = [...byId.values()].sort((a, b) => b.date.localeCompare(a.date));
  return { sermons, series: playlists.map((p) => p.title) };
}

/**
 * Merges several channels into one library. A video that appears on more than
 * one channel (re-uploads, cross-posts) is kept once — the first occurrence
 * wins, and a playlist-derived series name always beats the title heuristic.
 */
export async function fetchLibrarySermons(channelIds: readonly string[]) {
  const results = await Promise.all(channelIds.map((id) => fetchChannelSermons(id)));

  const byId = new Map<string, Sermon>();
  const byTitle = new Map<string, string>();

  for (const { sermons } of results) {
    for (const sermon of sermons) {
      const titleKey = sermon.title.trim().toLowerCase();
      const duplicateId = byTitle.get(titleKey);
      if (duplicateId) {
        const kept = byId.get(duplicateId);
        // Prefer a real playlist series over the generic fallback.
        if (kept && kept.series === "Messages" && sermon.series !== "Messages") {
          byId.set(duplicateId, { ...kept, series: sermon.series });
        }
        continue;
      }
      if (byId.has(sermon.videoId)) continue;
      byId.set(sermon.videoId, sermon);
      byTitle.set(titleKey, sermon.videoId);
    }
  }

  const sermons = [...byId.values()].sort((a, b) => b.date.localeCompare(a.date));
  const series = [...new Set(results.flatMap((r) => r.series))];
  return { sermons, series };
}
