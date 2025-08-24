import { useMemo, useState } from "preact/hooks";
import type { Participant, Translations } from "../types.ts";
import CategorySelector from "./CategorySelector.tsx";

interface ParticipantsTableProps {
  participants: Participant[];
  categories: string[];
  eventId: string;
  t: Translations;
  onUpdate?: (participants: Participant[]) => void;
}

const ITEMS_PER_PAGE = 20;

export default function ParticipantsTable(
  { participants, categories, eventId, t, onUpdate }: ParticipantsTableProps,
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingParticipant, setEditingParticipant] = useState<
    Participant | null
  >(null);

  const totalPages = Math.max(
    1,
    Math.ceil(participants.length / ITEMS_PER_PAGE),
  );
  const sortedParticipants = useMemo(
    () => [...participants].sort((a, b) => b.ticketNumber - a.ticketNumber),
    [participants],
  );

  const paginatedParticipants = useMemo(
    () =>
      sortedParticipants.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      ),
    [sortedParticipants, currentPage],
  );

  const handleEdit = (participant: Participant) => {
    setEditingParticipant({ ...participant }); // Create a copy
  };

  const handleInputChange = (e: Event) => {
    const { name, value } = e.target as HTMLInputElement;
    setEditingParticipant((p) => p ? { ...p, [name]: value } : null);
  };

  const handleCategoryChange = (newCategory: string) => {
    setEditingParticipant((p) => p ? { ...p, category: newCategory } : null);
  };

  const handleSave = async () => {
    if (!editingParticipant) return;

    const { name, provenance, category } = editingParticipant;
    const payload = { name, provenance, category };

    try {
      const response = await fetch(
        `/api/events/${eventId}/tickets/${editingParticipant.ticketNumber}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (response.ok) {
        // Update the local participants list if onUpdate is provided
        if (onUpdate) {
          const updatedParticipants = participants.map((p) =>
            p.ticketNumber === editingParticipant.ticketNumber
              ? { ...p, name, provenance, category }
              : p
          );
          onUpdate(updatedParticipants);
        } else {
          // Fallback to reload if no callback provided
          globalThis.location.reload();
        }
      } else {
        console.error("Failed to save participant data");
        alert("Failed to save participant data");
      }
    } catch (error) {
      console.error("Error saving participant:", error);
      alert(
        `An error occurred: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setEditingParticipant(null);
    }
  };

  return (
    <div class="space-y-4">
      {/* Table for desktop */}
      <div class="hidden md:block overflow-x-auto">
        <table class="min-w-full bg-transparent rounded-lg">
          <thead class="bg-slate-100 dark:bg-slate-700">
            <tr>
              <th class="p-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                {t.table_header_ticket}
              </th>
              <th class="p-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                {t.table_header_name}
              </th>
              <th class="p-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                {t.table_header_provenance}
              </th>
              <th class="p-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">
                {t.table_header_category}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedParticipants.map((p) => (
              <tr
                key={p.ticketNumber}
                onClick={() => handleEdit(p)}
                class="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-200 dark:border-slate-700"
              >
                <td class="p-3">#{p.ticketNumber}</td>
                <td class="p-3">
                  {p.name || (
                    <span class="text-slate-500 italic">{t.anonymous}</span>
                  )}
                </td>
                <td class="p-3">
                  {p.provenance || <span class="text-slate-500 italic">-</span>}
                </td>
                <td class="p-3">{p.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* List for mobile */}
      <div class="md:hidden space-y-3">
        {paginatedParticipants.map((p) => (
          <div
            key={p.ticketNumber}
            class="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg shadow cursor-pointer"
            onClick={() => handleEdit(p)}
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-bold text-sky-600 dark:text-sky-400 text-lg">
                  #{p.ticketNumber} - {p.name || t.anonymous}
                </p>
                {p.provenance && (
                  <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {t.table_header_provenance}: {p.provenance}
                  </p>
                )}
              </div>
              <p class="text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-1 rounded-full whitespace-nowrap">
                {p.category}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div class="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            class="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-md disabled:opacity-50"
          >
            {t.pagination_previous}
          </button>
          <span>
            {t.pagination_page.replace("{currentPage}", currentPage.toString())
              .replace("{totalPages}", totalPages.toString())}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            class="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-md disabled:opacity-50"
          >
            {t.pagination_next}
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingParticipant && (
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 class="text-2xl font-bold mb-4">
              {t.edit_participant_title} #{editingParticipant.ticketNumber}
            </h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">
                  {t.name_label}
                </label>
                <input
                  type="text"
                  name="name"
                  value={editingParticipant.name}
                  onInput={handleInputChange}
                  class="w-full p-2 bg-slate-200 dark:bg-slate-700 rounded-md"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">
                  {t.provenance_label}
                </label>
                <input
                  type="text"
                  name="provenance"
                  value={editingParticipant.provenance}
                  onInput={handleInputChange}
                  class="w-full p-2 bg-slate-200 dark:bg-slate-700 rounded-md"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">
                  {t.category_label}
                </label>
                <CategorySelector
                  categories={categories}
                  name="category"
                  value={editingParticipant.category}
                  onChange={handleCategoryChange}
                />
              </div>
            </div>
            <div class="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => setEditingParticipant(null)}
                class="px-4 py-2 bg-slate-200 dark:bg-slate-600 rounded-md"
              >
                {t.cancel_button}
              </button>
              <button
                type="button"
                onClick={handleSave}
                class="px-4 py-2 bg-sky-600 text-white rounded-md"
              >
                {t.save_changes_button}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
