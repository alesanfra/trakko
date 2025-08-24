import { useState } from "preact/hooks";
import type { Translations } from "../types.ts";

interface EventNotFoundPageProps {
  t: Translations;
}

export default function EventNotFoundPage({ t }: EventNotFoundPageProps) {
  const [eventCode, setEventCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Safe property access for new translation keys
  const getTranslation = (key: string, fallback: string = "") => {
    return (t as Record<string, string>)[key] || fallback;
  };

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    // Allow only alphanumeric characters and convert to uppercase
    const value = target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setEventCode(value);
    if (error) setError("");
  };

  const isValidEventCode = (code: string) => {
    // Event code should be at least 3 characters long
    return code.length >= 3;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    // Ensure the event code is uppercase and clean
    const cleanEventCode = eventCode.trim().toUpperCase();
    
    if (!cleanEventCode || !isValidEventCode(cleanEventCode)) {
      setError(getTranslation("invalid_event_code", "Please enter a valid event code"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Check if the event exists by making a request (using lowercase for URL)
      const response = await fetch(`/event/${cleanEventCode}`);
      
      if (response.ok) {
        // Event exists, navigate to it (using lowercase for URL)
        globalThis.location.href = `/event/${cleanEventCode}`;
      } else {
        // Event doesn't exist
        setError(getTranslation("invalid_event_code", "Please enter a valid event code"));
      }
    } catch (error) {
      console.error("Error checking event:", error);
      setError(getTranslation("invalid_event_code", "Please enter a valid event code"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col items-center justify-center p-4">
      <div class="w-full max-w-md">
        {/* 404 Icon */}
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            404
          </h1>
          <h2 class="text-2xl font-semibold text-sky-600 dark:text-sky-400 mb-2">
            {getTranslation("event_not_found_title", "Event Not Found")}
          </h2>
          <p class="text-slate-600 dark:text-slate-400 mb-6">
            {getTranslation("event_not_found_description", "The event you're looking for could not be found.")}
          </p>
        </div>

        {/* Suggestions */}
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6 border-4 border-sky-500">
          <h3 class="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
            {getTranslation("event_not_found_suggestions", "Here are some things you can try:")}
          </h3>
          <ul class="space-y-3 text-slate-600 dark:text-slate-400">
            <li class="flex items-start gap-3">
              <span class="text-sky-500 mt-1">✓</span>
              <span>{getTranslation("event_not_found_check_code", "Double-check the event code")}</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-sky-500 mt-1">✓</span>
              <span>{getTranslation("event_not_found_ask_organizer", "Ask the event organizer for the correct link")}</span>
            </li>
          </ul>
        </div>

        {/* Event Code Input */}
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-6 border-4 border-indigo-500">
          <h3 class="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
            {getTranslation("event_not_found_try_again", "Try entering the event code:")}
          </h3>
          
          <form onSubmit={handleSubmit} class="space-y-4">
            <div>
              <label
                htmlFor="eventCode"
                class="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300"
              >
                {getTranslation("event_code_label", "Event Code")}
              </label>
              <input
                type="text"
                id="eventCode"
                value={eventCode}
                onInput={handleInputChange}
                disabled={isSubmitting}
                class={`w-full p-3 bg-slate-200 dark:bg-slate-700 rounded-md border-2 focus:outline-none text-lg font-mono uppercase tracking-wider disabled:opacity-50 transition-colors ${
                  eventCode && isValidEventCode(eventCode)
                    ? "border-green-500 focus:border-green-500"
                    : eventCode && eventCode.length > 0
                    ? "border-orange-500 focus:border-orange-500"
                    : "border-slate-300 dark:border-slate-600 focus:border-indigo-500"
                }`}
                placeholder={getTranslation("event_code_placeholder", "Enter event code")}
                maxLength={20}
              />
              {eventCode && eventCode.length > 0 && !isValidEventCode(eventCode) && (
                <p class="text-orange-500 text-sm mt-2 text-center">
                  Event code should be at least 3 characters long
                </p>
              )}
              {error && (
                <p class="text-red-500 text-sm mt-2 text-center">{error}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !eventCode.trim() || !isValidEventCode(eventCode)}
              class="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span class="flex items-center justify-center gap-2">
                  <span class="animate-spin">⏳</span>
                  {getTranslation("go_to_event_button", "Go to Event")}...
                </span>
              ) : (
                getTranslation("go_to_event_button", "Go to Event")
              )}
            </button>
          </form>
        </div>

        {/* Back to Home */}
        <div class="text-center">
          <a
            href="/"
            class="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors duration-200"
          >
            <span>←</span>
            <span>{getTranslation("back_to_home", "Back to Home")}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
