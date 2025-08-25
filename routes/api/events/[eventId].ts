/// <reference lib="deno.unstable" />
import { Handlers } from "$fresh/server.ts";
import { EventRecord } from "../../../types.ts";

const kv = await Deno.openKv();

export const handler: Handlers = {
  async PATCH(req, ctx) {
    const { eventId } = ctx.params;
    const { name } = await req.json();

    if (typeof name !== "string" || name.length < 3 || name.length > 50) {
      return new Response(
        JSON.stringify({ message: "Invalid event name." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const eventKey = ["events", eventId];
    const eventRes = await kv.get<EventRecord>(eventKey);

    if (!eventRes.value) {
      return new Response(JSON.stringify({ message: "Event not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updatedEvent: EventRecord = {
      ...eventRes.value,
      name,
    };

    const result = await kv.atomic().check(eventRes).set(eventKey, updatedEvent)
      .commit();

    if (!result.ok) {
      return new Response(
        JSON.stringify({ message: "Failed to update event." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify(updatedEvent), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};
