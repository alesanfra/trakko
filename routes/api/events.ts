/// <reference lib="deno.unstable" />
import { Handlers } from "$fresh/server.ts";
import { encode } from "../../utils/crockford.ts";

const kv = await Deno.openKv();

export const handler: Handlers = {
  async POST(req) {
    const form = await req.formData();
    const eventName = form.get("name") as string;
    const categoriesStr = form.get("categories") as string;

    // Validate event name
    if (!eventName || eventName.trim().length < 3) {
      return new Response("Event name must be at least 3 characters long", {
        status: 400,
      });
    }
    if (eventName.trim().length > 50) {
      return new Response("Event name must be at most 50 characters long", {
        status: 400,
      });
    }

    const categories = categoriesStr.split(",").map((s) => s.trim()).slice(
      0,
      10,
    );

    const idBuffer = new Uint8Array(8);
    crypto.getRandomValues(idBuffer);
    const id = encode(idBuffer);

    await kv.set(["events", id], {
      name: eventName.trim(),
      categories,
      createdAt: new Date().toISOString(),
    });

    return new Response(null, {
      status: 303,
      headers: {
        Location: `/event/${id}/created`,
      },
    });
  },
};
