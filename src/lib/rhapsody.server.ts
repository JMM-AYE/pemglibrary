const HOME = "https://read.rhapsodyofrealities.org/";
const DEVOTIONAL = `${HOME}api/daily-devotional/`;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

export type Devotional = {
  slug: string;
  title: string;
  date: string;
  fullDate: string;
  cover: string;
  excerpt: string;
  bodyHtml: string;
  confessionTitle: string;
  confessionHtml: string;
  furtherStudy: string;
  readingA: string;
  readingB: string;
  sourceUrl: string;
};

function isoDate(offsetDays: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8217;|&rsquo;/g, "\u2019")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** The reader mints a short-lived `_read_IPA` bearer token on page load. */
async function fetchToken(): Promise<string | null> {
  const res = await fetch(HOME, { headers: { "user-agent": UA } });
  const headers = res.headers as Headers & { getSetCookie?: () => string[] };
  const raw = headers.getSetCookie ? headers.getSetCookie().join("; ") : (headers.get("set-cookie") ?? "");
  const match = /_read_IPA=([^;,\s]+)/.exec(raw);
  return match ? match[1] : null;
}

async function fetchOne(date: string, token: string): Promise<Devotional | null> {
  const res = await fetch(DEVOTIONAL + date, {
    headers: { authorization: `Bearer ${token}`, accept: "application/json", "user-agent": UA },
  });
  if (!res.ok) return null;
  const payload = (await res.json()) as {
    result?: Array<Record<string, string>>;
  };
  const entry = payload.result?.[0];
  if (!entry?.title) return null;

  const bodyHtml = entry["body"] ?? "";
  return {
    slug: `rhapsody-${date}-${slugify(entry["title"])}`.slice(0, 90),
    title: entry["title"],
    date,
    fullDate: entry["fulldate"] ?? date,
    cover: entry["image"] ?? "",
    excerpt: stripHtml(bodyHtml).slice(0, 220),
    bodyHtml,
    confessionTitle: entry["confess_title"] ?? "Confession",
    confessionHtml: entry["confess"] ?? "",
    furtherStudy: stripHtml(entry["study"] ?? ""),
    readingA: stripHtml(entry["BA"] ?? ""),
    readingB: stripHtml(entry["BB"] ?? ""),
    sourceUrl: HOME,
  };
}

/* ---------------------------------------------------------------- caching */

/** Per-day devotionals never change once published, so cache them for good. */
const dayCache = new Map<string, Devotional>();

type Cached = { at: number; value: Devotional[] };
let listCache: Cached | null = null;
let inFlight: Promise<Devotional[]> | null = null;

const LIST_TTL_MS = 1000 * 60 * 60 * 6;
const TOKEN_TTL_MS = 1000 * 60 * 20;

let tokenCache: { at: number; value: string } | null = null;

async function getToken(): Promise<string | null> {
  if (tokenCache && Date.now() - tokenCache.at < TOKEN_TTL_MS) return tokenCache.value;
  const token = await fetchToken();
  if (token) tokenCache = { at: Date.now(), value: token };
  return token;
}

async function loadDevotionals(days: number): Promise<Devotional[]> {
  const token = await getToken();
  if (!token) return [];
  const results = await Promise.all(
    Array.from({ length: days }, (_, i) => {
      const date = isoDate(i);
      const hit = dayCache.get(date);
      if (hit) return Promise.resolve(hit);
      return fetchOne(date, token)
        .then((entry) => {
          if (entry) dayCache.set(date, entry);
          return entry;
        })
        .catch(() => null);
    }),
  );
  return results.filter((d): d is Devotional => d !== null);
}

/** Today's devotional plus the previous `days - 1` readings, cached per day. */
export async function fetchDevotionals(days = 7): Promise<Devotional[]> {
  if (listCache && Date.now() - listCache.at < LIST_TTL_MS) return listCache.value;
  if (inFlight) return inFlight;

  inFlight = loadDevotionals(days)
    .then((value) => {
      if (value.length) listCache = { at: Date.now(), value };
      return value.length ? value : (listCache?.value ?? []);
    })
    .catch(() => listCache?.value ?? [])
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}