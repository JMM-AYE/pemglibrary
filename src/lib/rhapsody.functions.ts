import { createServerFn } from "@tanstack/react-start";
import { fetchDevotionals } from "./rhapsody.server";

export const getDevotionals = createServerFn({ method: "GET" }).handler(async () => {
  return await fetchDevotionals(7);
});