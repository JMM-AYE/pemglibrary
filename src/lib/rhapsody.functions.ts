import { createServerFn } from "@tanstack/react-start";
import { fetchDevotionals, fetchLanguages, DEFAULT_LANGUAGE } from "./rhapsody.server";

export const getDevotionals = createServerFn({ method: "GET" })
  .inputValidator((data: { language?: string } | undefined) => ({
    language: (data?.language ?? DEFAULT_LANGUAGE).toLowerCase().slice(0, 60),
  }))
  .handler(async ({ data }) => {
    return await fetchDevotionals(7, data.language);
  });

export const getDevotionalLanguages = createServerFn({ method: "GET" }).handler(async () => {
  return await fetchLanguages();
});
