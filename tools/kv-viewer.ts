#!/usr/bin/env -S deno run -A --unstable-kv

/**
 * Deno KV Database Viewer
 * Usage: deno run -A --unstable-kv kv-viewer.ts
 */

const kv = await Deno.openKv();

async function listAllEntries() {
  console.log("🗃️  Deno KV Database Contents\n");
  console.log("=".repeat(80));

  const entries = kv.list({ prefix: [] });
  let count = 0;

  for await (const entry of entries) {
    count++;
    console.log(`\n📝 Entry #${count}`);
    console.log(`🔑 Key: ${JSON.stringify(entry.key)}`);
    console.log(`📊 Value Type: ${typeof entry.value}`);
    console.log(`⏰ Version: ${entry.versionstamp}`);
    console.log(`💾 Value:`);
    console.log(JSON.stringify(entry.value, null, 2));
    console.log("-".repeat(40));
  }

  if (count === 0) {
    console.log("📭 Database is empty");
  } else {
    console.log(`\n✅ Total entries: ${count}`);
  }
}

async function listByPrefix(prefix: (string | number)[]) {
  console.log(`🔍 Listing entries with prefix: ${JSON.stringify(prefix)}\n`);

  const entries = kv.list({ prefix });
  let count = 0;

  for await (const entry of entries) {
    count++;
    console.log(`\n📝 Entry #${count}`);
    console.log(`🔑 Key: ${JSON.stringify(entry.key)}`);
    console.log(`💾 Value: ${JSON.stringify(entry.value, null, 2)}`);
    console.log("-".repeat(40));
  }

  console.log(
    `\n✅ Found ${count} entries with prefix ${JSON.stringify(prefix)}`,
  );
}

// Main execution
if (import.meta.main) {
  const args = Deno.args;

  if (args.length === 0) {
    // List all entries
    await listAllEntries();
  } else {
    // List entries with specific prefix
    const prefix = args.map((arg) => {
      // Try to parse as number if it looks like one
      if (/^\d+$/.test(arg)) {
        return parseInt(arg);
      }
      return arg;
    });
    await listByPrefix(prefix);
  }

  kv.close();
}
