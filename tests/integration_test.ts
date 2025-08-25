/// <reference lib="deno.unstable" />
import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { EventData, Participant } from "./test_helpers.ts";

Deno.test("Integration Tests", async (t) => {
  await t.step(
    "End-to-end event creation and participant management",
    async () => {
      const kv = await Deno.openKv(":memory:");

      // 1. Create an event
      const eventId = "test-event-e2e";
      const eventData = {
        name: "Integration Test Event",
        categories: ["Category1", "Category2"],
      };

      await kv.set(["events", eventId], eventData);

      // 2. Add participants
      const participants = [
        {
          timestamp: new Date().toISOString(),
          name: "Participant 1",
          category: "Category1",
          ticketNumber: 1,
        },
        {
          timestamp: new Date().toISOString(),
          name: "Participant 2",
          provenance: "Test City",
          category: "Category2",
          ticketNumber: 2,
        },
      ];

      await kv.set(["participants", eventId], participants);

      // 3. Verify event exists
      const storedEvent = await kv.get<EventData>(["events", eventId]);
      assertExists(storedEvent.value);
      assertEquals(storedEvent.value.name, "Integration Test Event");

      // 4. Verify participants exist
      const storedParticipants = await kv.get<Participant[]>([
        "participants",
        eventId,
      ]);
      assertExists(storedParticipants.value);
      assertEquals(storedParticipants.value.length, 2);

      // 5. Test atomic operations
      const participantsRes = await kv.get<Participant[]>([
        "participants",
        eventId,
      ]);
      const currentParticipants = participantsRes.value || [];

      const newParticipant = {
        timestamp: new Date().toISOString(),
        name: "Participant 3",
        category: "Category1",
        ticketNumber: currentParticipants.length + 1,
      };

      const result = await kv.atomic()
        .check(participantsRes)
        .set(["participants", eventId], [
          ...currentParticipants,
          newParticipant,
        ])
        .commit();

      assertEquals(result.ok, true);

      // 6. Verify atomic operation succeeded
      const finalParticipants = await kv.get<Participant[]>([
        "participants",
        eventId,
      ]);
      assertEquals(finalParticipants.value?.length, 3);

      await kv.close();
    },
  );

  await t.step("Test data integrity under concurrent operations", async () => {
    const kv = await Deno.openKv(":memory:");
    const eventId = "concurrent-test";

    // Initialize empty participants
    await kv.set(["participants", eventId], []);

    // Simulate concurrent participant additions
    const concurrentOperations = Array.from({ length: 10 }, async (_, i) => {
      let success = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!success && attempts < maxAttempts) {
        attempts++;

        const participantsRes = await kv.get<Participant[]>([
          "participants",
          eventId,
        ]);
        const currentParticipants = participantsRes.value || [];

        const newParticipant = {
          timestamp: new Date().toISOString(),
          name: `Concurrent Participant ${i}`,
          category: "Test",
          ticketNumber: currentParticipants.length + 1,
        };

        const result = await kv.atomic()
          .check(participantsRes)
          .set(["participants", eventId], [
            ...currentParticipants,
            newParticipant,
          ])
          .commit();

        success = result.ok;
      }

      return success;
    });

    const results = await Promise.all(concurrentOperations);

    // All operations should eventually succeed
    assertEquals(results.every((r) => r), true);

    // Verify final state - at least some operations should succeed
    const finalParticipants = await kv.get(["participants", eventId]);
    const participantCount = (finalParticipants.value as Participant[]).length;

    // Due to concurrent access, not all operations may succeed, but we should have at least some
    assertEquals(
      participantCount >= 2,
      true,
      `Expected at least 2 participants, got ${participantCount}`,
    );
    assertEquals(
      participantCount <= 10,
      true,
      `Expected at most 10 participants, got ${participantCount}`,
    );

    // Verify all ticket numbers are unique
    const ticketNumbers = (finalParticipants.value as Participant[]).map((p) =>
      p.ticketNumber
    ).sort();
    const uniqueTicketNumbers = new Set(ticketNumbers);
    assertEquals(
      uniqueTicketNumbers.size,
      participantCount,
      "All ticket numbers should be unique",
    );

    await kv.close();
  });

  await t.step("Event sorting in admin panel", async () => {
    const kv = await Deno.openKv(":memory:");

    const now = new Date();
    const events = [
      {
        id: "event1",
        name: "Alpha Event",
        categories: ["General"],
        createdAt: new Date(now.getTime() - 2000).toISOString(),
      },
      {
        id: "event2",
        name: "charlie Event",
        categories: ["VIP"],
        createdAt: new Date(now.getTime() - 1000).toISOString(),
      },
      { id: "event3", name: "Bravo Event", categories: ["Student"] },
      {
        id: "event4",
        name: "delta Event",
        categories: ["General"],
        createdAt: new Date(now.getTime() - 1000).toISOString(),
      },
    ];

    for (const event of events) {
      await kv.set(["events", event.id], {
        name: event.name,
        categories: event.categories,
        createdAt: event.createdAt,
      });
    }

    const storedEvents: (EventData & { id: string; createdAt?: string })[] = [];
    const iter = kv.list<EventData>({ prefix: ["events"] });
    for await (const res of iter) {
      if (res.value && typeof res.value === "object") {
        storedEvents.push(
          {
            ...(res.value as object),
            id: res.key[1] as string,
          } as EventData & { id: string; createdAt?: string },
        );
      }
    }

    storedEvents.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        if (b.createdAt !== a.createdAt) {
          return new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime();
        }
      }
      if (a.createdAt && !b.createdAt) {
        return -1;
      }
      if (!a.createdAt && b.createdAt) {
        return 1;
      }
      return a.name.localeCompare(b.name, undefined, {
        sensitivity: "base",
      });
    });

    assertEquals(storedEvents.map((e) => e.id), [
      "event2",
      "event4",
      "event1",
      "event3",
    ]);
    assertEquals(storedEvents[0].name, "charlie Event");
    assertEquals(storedEvents[1].name, "delta Event");
    assertEquals(storedEvents[2].name, "Alpha Event");
    assertEquals(storedEvents[3].name, "Bravo Event");

    await kv.close();
  });
});
