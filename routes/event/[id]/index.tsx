/// <reference lib="deno.unstable" />
import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { State } from "../../../routes/_middleware.ts";
import CategorySelector from "../../../islands/CategorySelector.tsx";
import ParticipantsTable from "../../../islands/ParticipantsTable.tsx";
import RealtimeUpdater from "../../../islands/RealtimeUpdater.tsx";

interface EventData {
  name: string;
  categories: string[];
}

interface Participant {
  timestamp: string;
  name?: string;
  provenance?: string;
  category: string;
  ticketNumber: number;
}

const kv = await Deno.openKv();

export const handler: Handlers<
  (EventData & { participants: Participant[] }) | null,
  State
> = {
  async GET(_req, ctx) {
    const { id } = ctx.params;
    const eventRes = await kv.get<EventData>(["events", id]);

    if (!eventRes.value) {
      return ctx.render(null);
    }

    const participantsRes = await kv.get<Participant[]>(["participants", id]);
    const participants = participantsRes.value ?? [];

    return ctx.render({ ...eventRes.value, participants });
  },
  async POST(req, ctx) {
    const { id } = ctx.params;
    const form = await req.formData();
    const name = form.get("name") as string | undefined;
    const provenance = form.get("provenance") as string | undefined;
    const category = form.get("category") as string;

    const kv = await Deno.openKv();

    // Use atomic operation to ensure ticket number uniqueness
    const participantsKey = ["participants", id];

    let success = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!success && attempts < maxAttempts) {
      attempts++;

      const participantsRes = await kv.get<Participant[]>(participantsKey);
      const currentParticipants = participantsRes.value ?? [];

      const newParticipant: Participant = {
        timestamp: new Date().toISOString(),
        name,
        provenance,
        category,
        ticketNumber: currentParticipants.length + 1,
      };

      // Use atomic operation to prevent race conditions
      const result = await kv.atomic()
        .check(participantsRes)
        .set(participantsKey, [...currentParticipants, newParticipant])
        .commit();

      success = result.ok;
    }

    if (!success) {
      return new Response("Failed to add participant after multiple attempts", {
        status: 500,
      });
    }

    // Redirect back to the same page to show the updated count
    return new Response(null, {
      status: 303,
      headers: {
        Location: `/event/${id}${ctx.url.search}`, // Preserve view
      },
    });
  },
};

export default function EventPage(
  { data, params, state, url }: PageProps<
    (EventData & { participants: Participant[] }) | null,
    State
  >,
) {
  const { t } = state;
  if (!data) {
    return <h1>{t.event_not_found}</h1>;
  }

  const view = url.searchParams.get("view") || "add";

  return (
    <>
      <Head>
        <title>{t.event_page_title.replace("{eventName}", data.name)}</title>
      </Head>
      <div class="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center p-4">
        <div class="w-full max-w-4xl">
          <div class="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
            <div class="flex items-center">
              <h1 class="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">
                {data.name}
              </h1>
              <RealtimeUpdater
                eventId={params.id}
                initialParticipants={data.participants}
              />
            </div>
            <div class="flex-shrink-0 flex gap-2">
              <a
                href={`/event/${params.id}?view=add`}
                class={`px-4 py-2 rounded-md text-sm font-semibold ${
                  view === "add"
                    ? "bg-sky-600 text-white shadow"
                    : "bg-white dark:bg-slate-700"
                }`}
              >
                Add Participant
              </a>
              <a
                href={`/event/${params.id}?view=list`}
                class={`px-4 py-2 rounded-md text-sm font-semibold ${
                  view === "list"
                    ? "bg-sky-600 text-white shadow"
                    : "bg-white dark:bg-slate-700"
                }`}
              >
                List Participants
              </a>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 md:p-8 border-4 border-sky-500 mb-8">
            {view === "add" && (
              <>
                <p class="text-2xl text-center text-slate-600 dark:text-slate-300 mb-6">
                  {t.current_ticket_label}:{" "}
                  <span class="font-bold text-indigo-500 dark:text-indigo-400">
                    #{data.participants.length + 1}
                  </span>
                </p>
                <form method="POST" class="space-y-8">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        class="text-lg font-semibold mb-2 block"
                      >
                        {t.name_label}
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        class="w-full p-3 bg-slate-200 dark:bg-slate-700 rounded-md border-2 border-slate-300 dark:border-slate-600 focus:border-sky-500 focus:outline-none"
                        placeholder={t.name_placeholder}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="provenance"
                        class="text-lg font-semibold mb-2 block"
                      >
                        Provenance (Optional)
                      </label>
                      <input
                        type="text"
                        id="provenance"
                        name="provenance"
                        class="w-full p-3 bg-slate-200 dark:bg-slate-700 rounded-md border-2 border-slate-300 dark:border-slate-600 focus:border-sky-500 focus:outline-none"
                        placeholder="e.g., City, Country"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="text-lg font-semibold mb-3 block">
                      {t.category_label}
                    </label>
                    <CategorySelector
                      categories={data.categories}
                      name="category"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      class="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-md hover:bg-sky-700 transition-colors duration-300 text-lg"
                    >
                      {t.save_record_button}
                    </button>
                  </div>
                </form>
              </>
            )}

            {view === "list" && (
              <ParticipantsTable
                participants={data.participants}
                categories={data.categories}
                eventId={params.id}
                t={state.t}
              />
            )}
          </div>

          <div class="text-center">
            <a
              href={`/event/${params.id}/export`}
              class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
            >
              {t.export_csv_button}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
