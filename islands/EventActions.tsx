// islands/EventActions.tsx
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { Translations } from "../locales/mod.ts";

interface EventActionsProps {
  eventUrl: string;
  fullUrl: string;
  t: Translations;
}

export default function EventActions(
  { eventUrl, fullUrl, t }: EventActionsProps,
) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    if (IS_BROWSER) {
      navigator.clipboard.writeText(fullUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      });
    }
  };

  return (
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        type="button"
        onClick={copyLink}
        disabled={!IS_BROWSER}
        class={`w-full sm:w-auto text-white font-bold py-3 px-6 rounded-md transition-colors duration-300 ${
          copied
            ? "bg-green-500 hover:bg-green-600"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {copied ? t.copied_button : t.copy_link_button}
      </button>
      <a
        href={eventUrl}
        class="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-md transition-colors duration-300 text-center"
      >
        {t.enter_event_button}
      </a>
    </div>
  );
}
