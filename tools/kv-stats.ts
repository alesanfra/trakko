#!/usr/bin/env -S deno run -A --unstable-kv

/**
 * Enhanced Deno KV Database Viewer with Statistics
 * Usage: deno run -A --unstable-kv kv-stats.ts
 */

const kv = await Deno.openKv();

interface EventData {
  name: string;
  categories: string[];
}

interface ParticipantData {
  timestamp: string;
  name?: string;
  provenance?: string;
  category: string;
  ticketNumber: number;
}

interface Stats {
  totalEntries: number;
  totalEvents: number;
  totalParticipants: number;
  eventStats: Array<{
    eventId: string;
    eventName: string;
    participantCount: number;
    categories: string[];
  }>;
}

async function generateStats(): Promise<Stats> {
  const stats: Stats = {
    totalEntries: 0,
    totalEvents: 0,
    totalParticipants: 0,
    eventStats: [],
  };

  // Get all events
  const events = new Map<string, EventData>();
  for await (const entry of kv.list({ prefix: ["events"] })) {
    stats.totalEntries++;
    stats.totalEvents++;
    const eventId = entry.key[1] as string;
    events.set(eventId, entry.value as EventData);
  }

  // Get all participants
  const participants = new Map<string, ParticipantData[]>();
  for await (const entry of kv.list({ prefix: ["participants"] })) {
    stats.totalEntries++;
    const eventId = entry.key[1] as string;
    const participantList = entry.value as ParticipantData[];
    participants.set(eventId, participantList);
    stats.totalParticipants += participantList.length;
  }

  // Generate event statistics
  for (const [eventId, eventData] of events) {
    const participantList = participants.get(eventId) || [];
    stats.eventStats.push({
      eventId,
      eventName: eventData.name,
      participantCount: participantList.length,
      categories: eventData.categories,
    });
  }

  // Sort by participant count (descending)
  stats.eventStats.sort((a, b) => b.participantCount - a.participantCount);

  return stats;
}

async function printStats() {
  console.log("📊 Deno KV Database Statistics\n");
  console.log("=".repeat(80));

  const stats = await generateStats();

  console.log(`\n📈 Overall Statistics:`);
  console.log(`   Total Entries: ${stats.totalEntries}`);
  console.log(`   Total Events: ${stats.totalEvents}`);
  console.log(`   Total Participants: ${stats.totalParticipants}`);
  console.log(
    `   Average Participants per Event: ${
      (stats.totalParticipants / stats.totalEvents).toFixed(1)
    }`,
  );

  console.log(`\n🎉 Event Details:`);
  stats.eventStats.forEach((event, index) => {
    console.log(`\n${index + 1}. 📅 ${event.eventName} (${event.eventId})`);
    console.log(`   👥 Participants: ${event.participantCount}`);
    console.log(`   🏷️  Categories: ${event.categories.join(", ")}`);
  });

  if (stats.eventStats.length > 0) {
    const mostPopular = stats.eventStats[0];
    const leastPopular = stats.eventStats[stats.eventStats.length - 1];
    console.log(
      `\n🏆 Most Popular Event: ${mostPopular.eventName} (${mostPopular.participantCount} participants)`,
    );
    console.log(
      `📉 Least Popular Event: ${leastPopular.eventName} (${leastPopular.participantCount} participants)`,
    );
  }
}

async function exportToJson() {
  console.log("💾 Exporting entire database to JSON...\n");

  const data: Record<
    string,
    { key: readonly unknown[]; value: unknown; versionstamp: string | null }
  > = {};

  for await (const entry of kv.list({ prefix: [] })) {
    const keyPath = entry.key.join("/");
    data[keyPath] = {
      key: entry.key,
      value: entry.value,
      versionstamp: entry.versionstamp,
    };
  }

  const filename = `kv-export-${new Date().toISOString().split("T")[0]}.json`;
  await Deno.writeTextFile(filename, JSON.stringify(data, null, 2));
  console.log(`✅ Database exported to: ${filename}`);
}

// Main execution
if (import.meta.main) {
  const command = Deno.args[0];

  switch (command) {
    case "stats":
      await printStats();
      break;
    case "export":
      await exportToJson();
      break;
    case "help":
      console.log(`
🗃️  Deno KV Database Tools

Usage:
  deno run -A --unstable-kv kv-stats.ts [command]

Commands:
  stats   - Show database statistics
  export  - Export entire database to JSON
  help    - Show this help message

Examples:
  deno run -A --unstable-kv kv-stats.ts stats
  deno run -A --unstable-kv kv-stats.ts export
      `);
      break;
    default:
      await printStats();
      break;
  }

  kv.close();
}
