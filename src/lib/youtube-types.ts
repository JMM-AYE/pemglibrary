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

export const PEMG_CHANNEL_ID = "UCrQeaCXWuaUa3pgAjvdUqnw";
