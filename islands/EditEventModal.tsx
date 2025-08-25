import { useState } from "preact/hooks";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  currentName: string;
  t: Record<string, string>;
}

export default function EditEventModal(
  { isOpen, onClose, eventId, currentName, t }: EditEventModalProps,
) {
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState("");

  const validateName = (name: string) => {
    if (name.length < 3) return t.edit_event_name_too_short;
    if (name.length > 50) return t.edit_event_name_too_long;
    return "";
  };

  const handleSave = async () => {
    const validationError = validateName(newName);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (response.ok) {
        onClose();
        // ricarica per aggiornare il nome mostrato
        globalThis.location?.reload();
      } else {
        const data = await response.json();
        setError(data.message || t.edit_event_generic_error);
      }
    } catch (err) {
      setError(t.edit_event_generic_error);
      console.error("Error updating event name:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">{t.edit_event_title}</h2>
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
            onClick={onClose}
            class="px-4 py-2 bg-slate-300 dark:bg-slate-600 rounded-md hover:bg-slate-400 dark:hover:bg-slate-500"
          >
            {t.cancel_button}
          </button>
          <button
            type="button"
            onClick={handleSave}
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            {t.save_changes_button}
          </button>
        </div>
      </div>
    </div>
  );
}
