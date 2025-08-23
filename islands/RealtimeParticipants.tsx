import { useEffect, useState } from "preact/hooks";

interface Participant {
  timestamp: string;
  name?: string;
  provenance?: string;
  category: string;
  ticketNumber: number;
}

interface RealtimeParticipantsProps {
  eventId: string;
  initialParticipants: Participant[];
  categories: string[];
  t: Record<string, string>;
  view: string;
}

export default function RealtimeParticipants({
  eventId,
  initialParticipants,
  categories,
  t,
  view
}: RealtimeParticipantsProps) {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const eventSource = new EventSource(`/api/events/${eventId}/watch`);
    
    eventSource.onopen = () => {
      setIsConnected(true);
    };
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "participants_update") {
          setParticipants(data.participants);
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };
    
    eventSource.onerror = () => {
      setIsConnected(false);
    };
    
    return () => {
      eventSource.close();
    };
  }, [eventId]);

  const currentTicketNumber = participants.length + 1;

  if (view === 'add') {
    return (
      <div>
        <div class="flex items-center justify-between mb-4">
          <p class="text-2xl text-center text-slate-600 dark:text-slate-300">
            {t.current_ticket_label}: <span class="font-bold text-indigo-500 dark:text-indigo-400">#{currentTicketNumber}</span>
          </p>
          <div class={`px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isConnected ? 'Live' : 'Disconnected'}
          </div>
        </div>
        
        <form method="POST" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" class="text-lg font-semibold mb-2 block">{t.name_label}</label>
              <input
                type="text"
                id="name"
                name="name"
                class="w-full p-3 bg-slate-200 dark:bg-slate-700 rounded-md border-2 border-slate-300 dark:border-slate-600 focus:border-sky-500 focus:outline-none"
                placeholder={t.name_placeholder}
              />
            </div>
            <div>
              <label htmlFor="provenance" class="text-lg font-semibold mb-2 block">{t.provenance_label}</label>
              <input
                type="text"
                id="provenance"
                name="provenance"
                class="w-full p-3 bg-slate-200 dark:bg-slate-700 rounded-md border-2 border-slate-300 dark:border-slate-600 focus:border-sky-500 focus:outline-none"
                placeholder={t.provenance_placeholder}
              />
            </div>
          </div>

          <div>
            <label class="text-lg font-semibold mb-3 block">{t.category_label}</label>
            <div class="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <label key={category} class="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    required
                    defaultChecked={index === 0}
                    class="mr-2"
                  />
                  <span class="px-4 py-2 rounded-full text-sm font-semibold border-2 border-slate-300 dark:border-slate-600">
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-md hover:bg-sky-700 transition-colors duration-300 text-lg"
            >
              {t.save_record_button}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold">Participants ({participants.length})</h3>
          <div class={`px-2 py-1 rounded text-xs ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isConnected ? 'Live' : 'Disconnected'}
          </div>
        </div>
        
        {participants.length === 0 ? (
          <p class="text-center text-slate-500 py-8">No participants yet.</p>
        ) : (
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-slate-100 dark:bg-slate-700">
                  <th class="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left">{t.table_header_ticket}</th>
                  <th class="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left">{t.table_header_name}</th>
                  <th class="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left">{t.table_header_provenance}</th>
                  <th class="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left">{t.table_header_category}</th>
                  <th class="border border-slate-300 dark:border-slate-600 px-4 py-2 text-left">{t.table_header_timestamp}</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.ticketNumber} class="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td class="border border-slate-300 dark:border-slate-600 px-4 py-2 font-mono">
                      #{participant.ticketNumber}
                    </td>
                    <td class="border border-slate-300 dark:border-slate-600 px-4 py-2">
                      {participant.name || t.anonymous}
                    </td>
                    <td class="border border-slate-300 dark:border-slate-600 px-4 py-2">
                      {participant.provenance || '-'}
                    </td>
                    <td class="border border-slate-300 dark:border-slate-600 px-4 py-2">
                      <span class="px-2 py-1 bg-sky-100 dark:bg-sky-800 text-sky-800 dark:text-sky-200 rounded text-sm">
                        {participant.category}
                      </span>
                    </td>
                    <td class="border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm">
                      {new Date(participant.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return null;
}
