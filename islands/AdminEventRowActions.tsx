import { useState } from "preact/hooks";
import { useSignal } from "@preact/signals";

interface AdminEventRowActionsProps {
  eventId: string;
  eventName: string;
}

export default function AdminEventRowActions(
  { eventId, eventName }: AdminEventRowActionsProps,
) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newName, setNewName] = useState(eventName);
  const [error, setError] = useState("");
  const isDeleting = useSignal(false);

  const validateName = (name: string) => {
    if (name.trim().length < 3) return "Name too short (min 3 characters)";
    if (name.trim().length > 50) return "Name too long (max 50 characters)";
    return "";
  };

  const handleSaveEdit = async () => {
    const validationError = validateName(newName);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        globalThis.location?.reload();
      } else {
        const data = await response.json();
        setError(data.message || "Error updating event");
      }
    } catch (err) {
      setError("Error updating event");
      console.error("Error updating event name:", err);
    }
  };

  const handleDelete = () => {
    isDeleting.value = true;

    // Create and submit form
    const form = globalThis.document.createElement("form");
    form.method = "POST";
    form.style.display = "none";

    const actionInput = globalThis.document.createElement("input");
    actionInput.type = "hidden";
    actionInput.name = "action";
    actionInput.value = "delete";

    const eventIdInput = globalThis.document.createElement("input");
    eventIdInput.type = "hidden";
    eventIdInput.name = "eventId";
    eventIdInput.value = eventId;

    form.appendChild(actionInput);
    form.appendChild(eventIdInput);
    globalThis.document.body.appendChild(form);
    form.submit();
  };

  return (
    <>
      <div class="flex items-center gap-2 ml-4">
        <button
          type="button"
          onClick={() => {
            setNewName(eventName);
            setError("");
            setIsEditModalOpen(true);
          }}
          class="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
          aria-label="Edit event name"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-5 h-5"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793z" />
            <path d="M11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          class="w-9 h-9 flex items-center justify-center rounded-full bg-slate-400 hover:bg-slate-500 text-white transition-colors"
          disabled={isDeleting.value}
          aria-label="Delete event"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 class="text-2xl font-bold mb-4">Edit Event Name</h2>
            <input
              type="text"
              value={newName}
              onInput={(e) => {
                setNewName((e.target as HTMLInputElement).value);
                setError("");
              }}
              class="w-full p-3 bg-slate-200 dark:bg-slate-700 rounded-md border-2 border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:outline-none"
              minLength={3}
              maxLength={50}
              required
            />
            {error && <p class="text-red-500 text-sm mt-2">{error}</p>}
            <div class="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                class="px-4 py-2 bg-slate-300 dark:bg-slate-600 rounded-md hover:bg-slate-400 dark:hover:bg-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
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
                onClick={() => setIsDeleteModalOpen(false)}
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
