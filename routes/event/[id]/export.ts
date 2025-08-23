/// <reference lib="deno.unstable" />
import { Handlers } from "$fresh/server.ts";

interface Participant {
  timestamp: string;
  name?: string;
  provenance?: string;
  category: string;
  ticketNumber: number;
}

const kv = await Deno.openKv();

function toCsv(participants: Participant[]): string {
    const headers = "TicketNumber,Timestamp,Name,Provenance,Category";
    const rows = participants.map(p => 
        `${p.ticketNumber},${p.timestamp},${p.name || ''},${p.provenance || ''},${p.category}`
    );
    return `${headers}\n${rows.join('\n')}`;
}

export const handler: Handlers = {
  async GET(_req, ctx) {
    const { id } = ctx.params;
    const participantsRes = await kv.get<Participant[]>(["participants", id]);
    const participants = participantsRes.value ?? [];

    const csv = toCsv(participants);
    
    const eventRes = await kv.get<{name: string}>(["events", id]);
    const eventName = eventRes.value?.name.replace(/\s/g, '_') || 'event';
    const fileName = `${eventName}_export_${new Date().toISOString().split('T')[0]}.csv`;

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  },
};
