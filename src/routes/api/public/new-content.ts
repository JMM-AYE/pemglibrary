import { createFileRoute } from "@tanstack/react-router";

/**
 * Scheduled sweep: alerts every account about newly published messages.
 * Call with `Authorization: Bearer <CONTENT_CRON_SECRET>`.
 */
export const Route = createFileRoute("/api/public/new-content")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["CONTENT_CRON_SECRET"];
        const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
        if (!secret || provided !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { notifyNewVideos } = await import("@/lib/content-alerts.server");
        try {
          return Response.json(await notifyNewVideos());
        } catch (error) {
          console.error("new-content sweep failed", error);
          return new Response("Sweep failed", { status: 500 });
        }
      },
    },
  },
});