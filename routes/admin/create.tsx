/// <reference lib="deno.unstable" />
import { Handlers } from "$fresh/server.ts";
import CategorySelector from "../../islands/CategorySelector.tsx";

export const handler: Handlers = {
  async POST(req, _ctx) {
    const form = await req.formData();
    const name = form.get("name")?.toString();
    const categories = form.getAll("categories").map((c) => c.toString());

    if (!name) {
      return new Response("Event name is required", { status: 400 });
    }

    const kv = await Deno.openKv();
    const id = crypto.randomUUID();
    await kv.set(["events", id], { name, categories });

    return new Response(null, {
      status: 303,
      headers: { Location: `/event/${id}/created` },
    });
  },
};

export default function CreateEventPage() {
  return (
    <div class="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white p-4">
      <div class="w-full max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-sky-600 dark:text-sky-400 mb-6">
          Create New Event
        </h1>
        <form
          method="POST"
          class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border-2 border-sky-500"
        >
          <div class="mb-4">
            <label for="name" class="block text-lg font-medium mb-2">
              Event Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              class="w-full px-3 py-2 bg-slate-200 dark:bg-slate-700 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div class="mb-6">
            <label class="block text-lg font-medium mb-2">Categories</label>
            <CategorySelector name="categories" categories={[]} />
          </div>
          <button
            type="submit"
            class="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
          >
            Create Event
          </button>
        </form>
      </div>
    </div>
  );
}
