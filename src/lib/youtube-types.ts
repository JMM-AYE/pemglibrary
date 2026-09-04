export type Sermon = {
  slug: string;
  videoId: string;
  title: string;
  series: string;
  date: string;
  summary: string;
  cover: string;
  coverFallback: string;
  views: number | null;
  url: string;
};

export const PEMG_CHANNEL_ID = "UCJAxUPzVhDs8nYrsXmSTKNg";

/** Every channel the library pulls messages from. Videos are de-duplicated by video id. */
export const PEMG_CHANNEL_IDS = [PEMG_CHANNEL_ID, "UCrQeaCXWuaUa3pgAjvdUqnw"] as const;
