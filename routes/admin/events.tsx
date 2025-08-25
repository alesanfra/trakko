/// <reference lib="deno.unstable" />
import { FreshContext, Handlers } from "$fresh/server.ts";
import { State } from "../_middleware.ts";
import DeleteEventButton from "../../islands/DeleteEventButton.tsx";

interface Event {
  id: string;
  name: string;
  categories: string[];
  createdAt?: string;
}

export const handler: Handlers<{ events: Event[] } | null, State> = {
  async GET(_req, ctx) {
    const kv = await Deno.openKv();
    const iter = kv.list<Event>({ prefix: ["events"] });
    const events: Event[] = [];
    for await (const res of iter) {
      events.push({ ...res.value, id: res.key[1] as string });
    }

    events.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        if (b.createdAt !== a.createdAt) {
          return new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime();
        }
      }
      if (a.createdAt && !b.createdAt) {
        return -1;
      }
      if (!a.createdAt && b.createdAt) {
        return 1;
      }
      return a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      });
    });

    return ctx.render({ events });
  },

  async POST(req, _ctx) {
    const form = await req.formData();
    const action = form.get("action")?.toString();
    const eventId = form.get("eventId")?.toString();

    if (action === "delete" && eventId) {
      const kv = await Deno.openKv();

      // Delete the event
      await kv.delete(["events", eventId]);

      // Delete all participants for this event
      await kv.delete(["participants", eventId]);

      // Optionally, clean up any other related data by iterating through keys
      // This ensures we catch any other event-related data that might exist
      const iter = kv.list({ prefix: ["event_data", eventId] });
      for await (const entry of iter) {
        await kv.delete(entry.key);
      }

      return new Response(null, {
        status: 303,
        headers: { Location: "/admin/events" },
      });
    }

    return new Response("Invalid action", { status: 400 });
  },
};

export default function AdminEventsPage(
  { data }: FreshContext<State, { events: Event[] } | null>,
) {
  const events = data?.events ?? [];

  return (
    <div class="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white p-4">
      <div class="w-full max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-sky-600 dark:text-sky-400">
            Admin - All Events
          </h1>
          <a
            href="/admin/logout"
            class="inline-block px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Logout
          </a>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 border-2 border-sky-500">
          {events.length === 0
            ? (
              <div class="text-center">
                <p class="mb-4">No events found.</p>
              </div>
            )
            : (
              <ul class="space-y-3">
                {events.map((event) => (
                  <li
                    key={event.id}
                    class="flex items-center justify-between p-4 rounded-md bg-slate-100 dark:bg-slate-700"
                  >
                    <a
                      href={`/event/${event.id}`}
                      class="flex-1 hover:bg-sky-100 dark:hover:bg-sky-800 transition-colors p-2 rounded"
                    >
                      <div class="flex items-center gap-3 mb-1">
                        <p class="font-semibold text-lg text-sky-700 dark:text-sky-300">
                          {event.name}
                        </p>
                        <span class="px-2 py-1 text-xs font-mono bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 rounded">
                          {event.id}
                        </span>
                      </div>
                      <p class="text-sm text-slate-600 dark:text-slate-400">
                        {event.categories.join(", ")}
                      </p>
                      {event.createdAt && (
                        <p class="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          Created on:{" "}
                          {new Date(event.createdAt).toLocaleString()}
                        </p>
                      )}
                    </a>
                    <DeleteEventButton
                      eventId={event.id}
                      eventName={event.name}
                    />
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>
    </div>
  );
}
