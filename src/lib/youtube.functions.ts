import { createServerFn } from "@tanstack/react-start";
import { fetchLibrarySermons } from "./youtube.server";
import { PEMG_CHANNEL_IDS } from "./youtube-types";

export const getSermons = createServerFn({ method: "GET" }).handler(async () => {
  return await fetchLibrarySermons(PEMG_CHANNEL_IDS);
});
