/// <reference lib="deno.unstable" />
import { Handlers } from "$fresh/server.ts";

interface Participant {
  timestamp: string;
  name?: string;
  provenance?: string;
  category: string;
  ticketNumber: number;
}

export const handler: Handlers = {
  GET(_req, ctx) {
    const { eventId } = ctx.params;

    // Set up Server-Sent Events
    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    const body = new ReadableStream({
      async start(controller) {
        const kv = await Deno.openKv();
        let isClosed = false;

        // Send initial data
        const participantsRes = await kv.get<Participant[]>([
          "participants",
          eventId,
        ]);
        const participants = participantsRes.value ?? [];

        const encoder = new TextEncoder();

        try {
          controller.enqueue(encoder.encode(`data: ${
            JSON.stringify({
              type: "participants_update",
              participants,
              count: participants.length,
            })
          }\n\n`));
        } catch (error) {
          console.log("Failed to send initial data:", error);
          return;
        }

        // Watch for changes
        const watchIterator = kv.watch([["participants", eventId]]);

        try {
          for await (const [entry] of watchIterator) {
            if (isClosed) break;

            const participants = entry.value as Participant[] ?? [];

            try {
              controller.enqueue(encoder.encode(`data: ${
                JSON.stringify({
                  type: "participants_update",
                  participants,
                  count: participants.length,
                })
              }\n\n`));
            } catch (_error) {
              console.log("Client disconnected, stopping watch");
              isClosed = true;
              break;
            }
          }
        } catch (error) {
          if (!isClosed) {
            console.error("SSE Watch error:", error);
          }
        }
      },

      cancel() {
        console.log("SSE connection closed");
      },
    });

    return new Response(body, { headers });
  },
};
