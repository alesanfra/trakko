import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { encode } from "../../utils/crockford.ts";

Deno.test("Crockford encoding", async (t) => {
  await t.step("should encode empty buffer", () => {
    const buffer = new Uint8Array(0);
    const result = encode(buffer);
    assertEquals(result, "");
  });

  await t.step("should encode single byte", () => {
    const buffer = new Uint8Array([0]);
    const result = encode(buffer);
    assertEquals(result, "0");
  });

  await t.step("should encode multiple bytes", () => {
    const buffer = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const result = encode(buffer);
    assertEquals(result, "012345");
  });

  await t.step("should handle values beyond encoding length", () => {
    const buffer = new Uint8Array([32, 33, 34]); // Values that wrap around
    const result = encode(buffer);
    assertEquals(result.length, 3);
    // Each character should be from the valid encoding set
    for (const char of result) {
      assertEquals("0123456789ABCDEFGHJKMNPQRSTVWXYZ".includes(char), true);
    }
  });

  await t.step("should generate different results for different inputs", () => {
    const buffer1 = new Uint8Array([1, 2, 3]);
    const buffer2 = new Uint8Array([4, 5, 6]);
    const result1 = encode(buffer1);
    const result2 = encode(buffer2);
    assertNotEquals(result1, result2);
  });

  await t.step("should be deterministic", () => {
    const buffer = new Uint8Array([10, 20, 30]);
    const result1 = encode(buffer);
    const result2 = encode(buffer);
    assertEquals(result1, result2);
  });
});
