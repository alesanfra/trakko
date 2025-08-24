import { useEffect, useState } from "preact/hooks";
import type { Participant, Translations } from "../types.ts";
import CategorySelector from "./CategorySelector.tsx";
import ParticipantsTable from "./ParticipantsTable.tsx";
import RealtimeUpdater from "./RealtimeUpdater.tsx";

interface EventData {
  name: string;
  categories: string[];
}

interface EventPageProps {
  event: EventData;
  initialParticipants: Participant[];
  eventId: string;
  initialView: string;
  t: Translations;
}

export default function EventPage(
  { event, initialParticipants, eventId, initialView, t }: EventPageProps,
) {
  const [participants, setParticipants] = useState<Participant[]>(
    initialParticipants,
  );
  const [currentView, setCurrentView] = useState(initialView);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update URL without reload when view changes
  const changeView = (newView: string) => {
    setCurrentView(newView);
    const url = new URL(globalThis.location.href);
    url.searchParams.set("view", newView);
    globalThis.history.pushState({}, "", url.toString());
  };

  // Handle form submission via AJAX
  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch(globalThis.location.pathname, {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (response.ok) {
        // Clear the form
        form.reset();
        // The realtime updater will handle updating the participants list
      } else {
        console.error("Failed to add participant");
        alert("Failed to add participant");
      }
    } catch (error) {
      console.error("Error adding participant:", error);
      alert("An error occurred while adding participant");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle participants update from SSE
  const handleParticipantsUpdate = (updatedParticipants: Participant[]) => {
    setParticipants(updatedParticipants);
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(globalThis.location.href);
      const view = url.searchParams.get("view") || "add";
      setCurrentView(view);
    };

    globalThis.addEventListener("popstate", handlePopState);
    return () => globalThis.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div class="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center p-4">
      <div class="w-full max-w-4xl">
        <div class="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
          <div class="flex items-center">
            <h1 class="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">
              {event.name}
            </h1>
            <RealtimeUpdater
              eventId={eventId}
              initialParticipants={initialParticipants}
              onUpdate={handleParticipantsUpdate}
            />
          </div>
          <div class="flex-shrink-0 flex gap-2">
            <button
              type="button"
              onClick={() => changeView("add")}
              class={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                currentView === "add"
                  ? "bg-sky-600 text-white shadow"
                  : "bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
              }`}
            >
              {t.add_participant_view}
            </button>
            <button
              type="button"
              onClick={() => changeView("list")}
              class={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                currentView === "list"
                  ? "bg-sky-600 text-white shadow"
                  : "bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
              }`}
            >
              {t.list_participants_view}
            </button>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 md:p-8 border-4 border-sky-500 mb-8">
          {currentView === "add" && (
            <>
              <p class="text-2xl text-center text-slate-600 dark:text-slate-300 mb-6">
                {t.current_ticket_label}:{" "}
                <span class="font-bold text-indigo-500 dark:text-indigo-400">
                  #{participants.length + 1}
                </span>
              </p>
              <form onSubmit={handleSubmit} class="space-y-8">
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
                      disabled={isSubmitting}
                      class="w-full p-3 bg-slate-200 dark:bg-slate-700 rounded-md border-2 border-slate-300 dark:border-slate-600 focus:border-sky-500 focus:outline-none disabled:opacity-50"
                      placeholder={t.name_placeholder}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="provenance"
                      class="text-lg font-semibold mb-2 block"
                    >
                      {t.provenance_label}
                    </label>
                    <input
                      type="text"
                      id="provenance"
                      name="provenance"
                      disabled={isSubmitting}
                      class="w-full p-3 bg-slate-200 dark:bg-slate-700 rounded-md border-2 border-slate-300 dark:border-slate-600 focus:border-sky-500 focus:outline-none disabled:opacity-50"
                      placeholder={t.provenance_placeholder}
                    />
                  </div>
                </div>

                <div>
                  <label class="text-lg font-semibold mb-3 block">
                    {t.category_label}
                  </label>
                  <CategorySelector
                    categories={event.categories}
                    name="category"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    class="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-md hover:bg-sky-700 transition-colors duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? t.saving_button || "Saving..."
                      : t.save_record_button}
                  </button>
                </div>
              </form>
            </>
          )}

          {currentView === "list" && (
            <ParticipantsTable
              participants={participants}
              categories={event.categories}
              eventId={eventId}
              t={t}
              onUpdate={handleParticipantsUpdate}
            />
          )}
        </div>

        <div class="text-center">
          <a
            href={`/event/${eventId}/export`}
            class="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded"
          >
            {t.export_csv_button}
          </a>
        </div>
      </div>
    </div>
  );
}
