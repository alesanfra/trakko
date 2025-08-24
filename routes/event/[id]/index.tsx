/// <reference lib="deno.unstable" />
import { Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { State } from "../../../routes/_middleware.ts";
import EventPageIsland from "../../../islands/EventPage.tsx";
import EventNotFoundPage from "../../../islands/EventNotFoundPage.tsx";

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
      return new Response(
        JSON.stringify({
          error: "Failed to add participant after multiple attempts",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Check if it's an AJAX request by looking at the Content-Type or Accept headers
    const acceptHeader = req.headers.get("accept") || "";
    const isAjax = acceptHeader.includes("application/json") ||
      req.headers.get("x-requested-with") === "XMLHttpRequest";

    if (isAjax) {
      // Return JSON response for AJAX requests
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Redirect for traditional form submissions (fallback)
      return new Response(null, {
        status: 303,
        headers: {
          Location: `/event/${id}${ctx.url.search}`, // Preserve view
        },
      });
    }
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
    return (
      <>
        <Head>
          <title>
            {(t as Record<string, string>)["event_not_found_title"] ||
              t.event_not_found} - {t.title}
          </title>
        </Head>
        <EventNotFoundPage t={t} />
      </>
    );
  }

  const view = url.searchParams.get("view") || "add";

  return (
    <>
      <Head>
        <title>{t.event_page_title.replace("{eventName}", data.name)}</title>
      </Head>
      <EventPageIsland
        event={{ name: data.name, categories: data.categories }}
        initialParticipants={data.participants}
        eventId={params.id}
        initialView={view}
        t={t}
      />
    </>
  );
}
