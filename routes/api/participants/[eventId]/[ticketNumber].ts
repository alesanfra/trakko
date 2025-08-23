/// <reference lib="deno.unstable" />
import { Handlers } from "$fresh/server.ts";

interface Participant {
  timestamp: string;
  name?: string;
  provenance?: string;
  category: string;
  ticketNumber: number;
}

export const handler: Handlers = {
  async PATCH(req, ctx) {
    const { eventId, ticketNumber } = ctx.params;
    const ticketNum = parseInt(ticketNumber, 10);

    if (isNaN(ticketNum)) {
      return new Response("Invalid ticket number", { status: 400 });
    }

    const kv = await Deno.openKv();
    const participantsKey = ["participants", eventId];
    
    const participantsRes = await kv.get<Participant[]>(participantsKey);
    const participants = participantsRes.value;

    if (!participants) {
      return new Response("Participants not found", { status: 404 });
    }

    const participantIndex = participants.findIndex(p => p.ticketNumber === ticketNum);

    if (participantIndex === -1) {
      return new Response("Participant not found", { status: 404 });
    }

    const updates = await req.json();
    
    // Update the participant record
    participants[participantIndex] = {
      ...participants[participantIndex],
      ...updates,
    };

    await kv.set(participantsKey, participants);

    return new Response(JSON.stringify(participants[participantIndex]), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
