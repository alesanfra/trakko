/// <reference lib="deno.unstable" />
import { useState } from "preact/hooks";
import { useSignal } from "@preact/signals";

interface DeleteEventButtonProps {
  eventId: string;
  eventName: string;
}

export default function DeleteEventButton(
  { eventId, eventName }: DeleteEventButtonProps,
) {
  const [isOpen, setIsOpen] = useState(false);
  const isDeleting = useSignal(false);

  const handleDelete = () => {
    isDeleting.value = true;

    // Create and submit form
    const form = document.createElement("form");
    form.method = "POST";
    form.style.display = "none";

    const actionInput = document.createElement("input");
    actionInput.type = "hidden";
    actionInput.name = "action";
    actionInput.value = "delete";

    const eventIdInput = document.createElement("input");
    eventIdInput.type = "hidden";
    eventIdInput.name = "eventId";
    eventIdInput.value = eventId;

    form.appendChild(actionInput);
    form.appendChild(eventIdInput);
    document.body.appendChild(form);
    form.submit();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        class="px-3 py-1 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
        disabled={isDeleting.value}
      >
        Delete
      </button>

      {isOpen && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h2 class="text-xl font-bold mb-4 text-red-600 dark:text-red-400">
              Confirm Deletion
            </h2>
            <p class="mb-4 text-slate-700 dark:text-slate-300">
              Are you sure you want to delete the event
              <strong class="font-bold">"{eventName}"</strong>?
              <br />
              <br />
              <strong class="text-red-600 dark:text-red-400">
                This action is irreversible and will permanently remove all
                event data.
              </strong>
            </p>
            <div class="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                class="px-4 py-2 rounded-md text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"
                disabled={isDeleting.value}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                class="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting.value}
              >
                {isDeleting.value ? "Deleting..." : "Delete Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
