# Test Suite

This directory contains unit and integration tests for the Trakko event
management system.

## Running Tests

Run all tests:

```bash
deno task test
```

Run tests with watch mode:

```bash
deno task test:watch
```

Run specific test files:

```bash
deno test --allow-read --allow-write --unstable-kv tests/basic_test.ts
deno test --allow-read --allow-write --unstable-kv tests/utils/
deno test --allow-read --allow-write --unstable-kv tests/integration_test.ts
```

## Test Structure

### `/tests/basic_test.ts`

- Basic functionality verification
- Deno KV operations
- Atomic operations testing

### `/tests/utils/`

- `crockford_test.ts`: Tests for Crockford base32 encoding utility
- Comprehensive edge case testing
- Deterministic behavior verification

### `/tests/integration_test.ts`

- End-to-end event creation and participant management
- Concurrent operations safety testing
- Data integrity verification under high load
- Atomic operations race condition testing

### `/tests/test_helpers.ts`

- Shared test utilities and mock data
- Type definitions for testing
- Mock context creation helpers

## Test Coverage

### ✅ Fully Working Tests

- **Utility Functions**: 100% coverage of Crockford encoding
- **Core Logic**: KV operations, atomic transactions
- **Integration**: End-to-end workflows, concurrency safety
- **Data Integrity**: Race condition handling, unique ticket numbers

## Key Test Features

1. **Atomic Operations Testing**: Ensures data consistency under concurrent
   access
2. **Race Condition Simulation**: Tests multiple simultaneous participant
   additions
3. **Data Integrity**: Verifies unique ticket numbers and proper sequencing
4. **Memory KV**: Uses in-memory database for fast, isolated tests
5. **Edge Cases**: Empty data, invalid inputs, boundary conditions

## Test Philosophy

- **Isolation**: Each test uses its own KV instance
- **Deterministic**: Tests produce consistent results
- **Fast**: In-memory operations for quick feedback
- **Comprehensive**: Covers happy path and error conditions
- **Real-world**: Simulates actual concurrent usage patterns
- **Clean**: Only working tests, no broken code

## Future Improvements

- Add HTTP-level API tests with proper Fresh context mocking
- Add browser/client-side component tests
- Add performance benchmarking tests
- Add E2E tests with real HTTP requests
- Add visual regression tests for UI components
