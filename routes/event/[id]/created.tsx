import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import EventActions from "../../../islands/EventActions.tsx";
import { State } from "../../../routes/_middleware.ts";

export default function EventCreated({ params, url, state }: PageProps<null, State>) {
  const eventUrl = `/event/${params.id}`;
  const fullUrl = url.href.replace(/\/created$/, "");
  const { t } = state;

  return (
    <>
      <Head>
        <title>{t.event_created_title}</title>
      </Head>
      <div class="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center justify-center p-4">
        <div class="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 border-4 border-teal-500 text-center">
          <h1 class="text-4xl font-bold mb-4 text-teal-600 dark:text-teal-400">{t.event_created_success}</h1>
          <p class="text-lg mb-6">{t.share_link_text}</p>
          <div class="bg-slate-200 dark:bg-slate-700 p-4 rounded-md mb-6">
            <input
              type="text"
              readOnly
              value={fullUrl}
              class="w-full bg-transparent text-center text-lg font-mono"
            />
          </div>
          <EventActions eventUrl={eventUrl} fullUrl={fullUrl} t={t} />
        </div>
      </div>
    </>
  );
}
