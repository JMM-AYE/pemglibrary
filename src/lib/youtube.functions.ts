import { createServerFn } from "@tanstack/react-start";
import { fetchChannelSermons } from "./youtube.server";
import { PEMG_CHANNEL_ID } from "./youtube-types";

export const getSermons = createServerFn({ method: "GET" }).handler(async () => {
  const sermons = await fetchChannelSermons(PEMG_CHANNEL_ID);
  return { sermons };
});
