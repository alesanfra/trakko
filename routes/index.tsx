import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { State } from "./_middleware.ts";

export default function Home(props: PageProps<null, State>) {
  const { t } = props.state;
  return (
    <>
      <Head>
        <title>{t.title}</title>
      </Head>
      <div class="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center justify-center p-4">
        <div class="max-w-md w-full bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 border-4 border-indigo-500">
          <h1 class="text-5xl font-bold text-center mb-8 text-indigo-600 dark:text-indigo-400">{t.title}</h1>
          <form action="/api/create_event" method="post" class="space-y-6">
            <div>
              <label htmlFor="name" class="text-lg font-semibold mb-2 block">{t.event_name_label}</label>
              <input
                type="text"
                id="name"
                name="name"
                maxLength={50}
                required
                class="w-full p-3 bg-slate-200 dark:bg-slate-700 rounded-md border-2 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:outline-none"
                placeholder={t.event_name_placeholder}
              />
            </div>
            <div>
              <label htmlFor="categories" class="text-lg font-semibold mb-2 block">
                {t.categories_label}
              </label>
              <input
                type="text"
                id="categories"
                name="categories"
                defaultValue={t.default_categories}
                class="w-full p-3 bg-slate-200 dark:bg-slate-700 rounded-md border-2 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:outline-none"
                placeholder={t.categories_placeholder}
              />
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.categories_helper}</p>
            </div>
            <button
              type="submit"
              class="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-300 text-lg"
            >
              {t.create_event_button}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
