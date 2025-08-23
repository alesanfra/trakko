import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("Basic functionality test", () => {
  // Test that basic assertions work
  assertEquals(1 + 1, 2);
  assertEquals("test".toUpperCase(), "TEST");

  // Test that we can create objects
  const testObj = { name: "test", value: 42 };
  assertEquals(testObj.name, "test");
  assertEquals(testObj.value, 42);
});

Deno.test("KV basic operations", async () => {
  const kv = await Deno.openKv(":memory:");

  // Test set and get
  await kv.set(["test"], "value");
  const result = await kv.get(["test"]);
  assertEquals(result.value, "value");

  // Test atomic operations
  const atomicResult = await kv.atomic()
    .check(result)
    .set(["test"], "new value")
    .commit();

  assertEquals(atomicResult.ok, true);

  const finalResult = await kv.get(["test"]);
  assertEquals(finalResult.value, "new value");

  await kv.close();
});
