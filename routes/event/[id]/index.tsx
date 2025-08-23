/// <reference lib="deno.unstable" />
import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { State } from "../../../routes/_middleware.ts";

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

export const handler: Handlers<(EventData & { participants: Participant[] }) | null, State> = {
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

    const participantsKey = ["participants", id];
    const participantsRes = await kv.get<Participant[]>(participantsKey);
    const currentParticipants = participantsRes.value ?? [];
    
    const newParticipant: Participant = {
        timestamp: new Date().toISOString(),
        name,
        provenance,
        category,
        ticketNumber: currentParticipants.length + 1,
    };

    await kv.set(participantsKey, [...currentParticipants, newParticipant]);

    // Redirect back to the same page to show the updated count
    return new Response(null, {
        status: 303,
        headers: {
            Location: `/event/${id}`
        }
    });
  }
};

export default function EventPage({ data, params, state }: PageProps<(EventData & { participants: Participant[] }) | null, State>) {
  const { t } = state;
  if (!data) {
    return <h1>{t.event_not_found}</h1>;
  }

  const currentTicketNumber = data.participants.length + 1;

  return (
    <>
      <Head>
        <title>{t.event_page_title.replace('{eventName}', data.name)}</title>
      </Head>
      <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center p-4">
        <div class="w-full max-w-4xl">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border-4 border-purple-500 dark:border-purple-500 mb-8">
            <h1 class="text-4xl font-bold text-center text-purple-600 dark:text-purple-400 mb-2">{data.name}</h1>
            <p class="text-2xl text-center text-gray-600 dark:text-gray-300 mb-6">
              {t.current_ticket_label}: <span class="font-bold text-yellow-500 dark:text-yellow-400">#{currentTicketNumber}</span>
            </p>
            <form method="POST" class="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div class="md:col-span-1">
                <label htmlFor="name" class="text-lg font-semibold mb-2 block">{t.name_label}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  class="w-full p-3 bg-gray-200 dark:bg-gray-700 rounded-md border-2 border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none"
                  placeholder={t.name_placeholder}
                />
              </div>
              <div class="md:col-span-1">
                <label htmlFor="provenance" class="text-lg font-semibold mb-2 block">{t.provenance_label}</label>
                <input
                  type="text"
                  id="provenance"
                  name="provenance"
                  class="w-full p-3 bg-gray-200 dark:bg-gray-700 rounded-md border-2 border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none"
                  placeholder={t.provenance_placeholder}
                />
              </div>
              <div class="md:col-span-1">
                <label htmlFor="category" class="text-lg font-semibold mb-2 block">{t.category_label}</label>
                <select
                  id="category"
                  name="category"
                  required
                  class="w-full p-3 bg-gray-200 dark:bg-gray-700 rounded-md border-2 border-gray-300 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-500 focus:outline-none appearance-none"
                >
                  {data.categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div class="md:col-span-1">
                <button
                  type="submit"
                  class="w-full bg-purple-500 text-white font-bold py-3 px-4 rounded-md hover:bg-purple-600 transition-colors duration-300 text-lg"
                >
                  {t.save_record_button}
                </button>
              </div>
            </form>
          </div>
          
          <div class="text-center">
             <a href={`/event/${params.id}/export`} class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                {t.export_csv_button}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
