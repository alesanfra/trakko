/// <reference lib="deno.unstable" />

export interface EventData {
  name: string;
  categories: string[];
}

export interface Participant {
  timestamp: string;
  name?: string;
  provenance?: string;
  category: string;
  ticketNumber: number;
}

export async function createTestKvData(kv: Deno.Kv, eventId: string) {
  const eventData: EventData = {
    name: "Test Event",
    categories: ["Adult", "Child", "Senior"],
  };

  const participants: Participant[] = [
    {
      timestamp: "2025-08-23T10:00:00Z",
      name: "Test User",
      category: "Adult",
      ticketNumber: 1,
    },
  ];

  await kv.set(["events", eventId], eventData);
  await kv.set(["participants", eventId], participants);

  return { eventData, participants };
}
