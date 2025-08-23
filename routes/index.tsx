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
      <div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center justify-center p-4">
        <div class="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border-4 border-yellow-400 dark:border-yellow-400">
          <h1 class="text-5xl font-bold text-center mb-8 text-yellow-500 dark:text-yellow-400">{t.title}</h1>
          <form action="/api/create_event" method="post" class="space-y-6">
            <div>
              <label htmlFor="name" class="text-lg font-semibold mb-2 block">{t.event_name_label}</label>
              <input
                type="text"
                id="name"
                name="name"
                maxLength={50}
                required
                class="w-full p-3 bg-gray-200 dark:bg-gray-700 rounded-md border-2 border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400 focus:outline-none"
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
                class="w-full p-3 bg-gray-200 dark:bg-gray-700 rounded-md border-2 border-gray-300 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400 focus:outline-none"
                placeholder={t.categories_placeholder}
              />
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.categories_helper}</p>
            </div>
            <button
              type="submit"
              class="w-full bg-yellow-400 text-gray-900 font-bold py-3 px-4 rounded-md hover:bg-yellow-500 transition-colors duration-300 text-lg"
            >
              {t.create_event_button}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
