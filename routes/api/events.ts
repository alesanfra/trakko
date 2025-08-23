/// <reference lib="deno.unstable" />
import { Handlers } from "$fresh/server.ts";
import { encode } from "../../utils/crockford.ts";

const kv = await Deno.openKv();

export const handler: Handlers = {
  async POST(req) {
    const form = await req.formData();
    const eventName = form.get("name") as string;
    const categoriesStr = form.get("categories") as string;
    const categories = categoriesStr.split(",").map((s) => s.trim()).slice(
      0,
      10,
    );

    const idBuffer = new Uint8Array(8);
    crypto.getRandomValues(idBuffer);
    const id = encode(idBuffer);

    await kv.set(["events", id], { name: eventName, categories });

    return new Response(null, {
      status: 303,
      headers: {
        Location: `/event/${id}/created`,
      },
    });
  },
};
