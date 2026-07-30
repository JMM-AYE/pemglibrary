import type { Sermon } from "./youtube-types";

const FEED = "https://www.youtube.com/feeds/videos.xml?channel_id=";

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

export async function fetchChannelSermons(channelId: string): Promise<Sermon[]> {
  const res = await fetch(`${FEED}${encodeURIComponent(channelId)}`, {
    headers: { accept: "application/atom+xml" },
  });
  if (!res.ok) {
    console.error(`YouTube feed request failed [${res.status}]: ${await res.text()}`);
    return [];
  }
  const xml = await res.text();
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
      series: parts[1] || "Messages",
      date: pick(entry, /<published>([^<]+)<\/published>/),
      summary: description || rawTitle,
      cover: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      coverFallback: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      views: views ? Number(views) : null,
      url: `https://www.youtube.com/watch?v=${id}`,
    } satisfies Sermon;
  });
}
