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
    const { eventId, ticketId } = ctx.params;
    const ticketNum = parseInt(ticketId, 10);

    if (isNaN(ticketNum)) {
      return new Response("Invalid ticket ID", { status: 400 });
    }

    const kv = await Deno.openKv();
    const participantsKey = ["participants", eventId];
    
    let success = false;
    let attempts = 0;
    const maxAttempts = 10;
    let updatedParticipant;
    
    while (!success && attempts < maxAttempts) {
      attempts++;
      
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
      
      updatedParticipant = participants[participantIndex];

      // Use atomic operation to prevent race conditions
      const result = await kv.atomic()
        .check(participantsRes)
        .set(participantsKey, participants)
        .commit();
        
      success = result.ok;
    }
    
    if (!success) {
      return new Response("Failed to update participant after multiple attempts", { status: 500 });
    }

    return new Response(JSON.stringify(updatedParticipant), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
