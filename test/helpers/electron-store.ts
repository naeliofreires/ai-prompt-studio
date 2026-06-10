import { vi } from "vitest";

const DEFAULT_RANDOM_UUID = "550e8400-e29b-41d4-a716-446655440000";

export const electronStoreMocks = {
  randomUUID: vi.fn(() => "550e8400-e29b-41d4-a716-446655440000"),
  values: new Map<string, unknown>(),
};

export function mockNodeCrypto() {
  return {
    default: {
      randomUUID: electronStoreMocks.randomUUID,
    },
    randomUUID: electronStoreMocks.randomUUID,
  };
}

export function mockElectronStore(defaultKey: string) {
  return {
    default: class MockStore {
      constructor() {
        if (!electronStoreMocks.values.has(defaultKey)) {
          electronStoreMocks.values.set(defaultKey, []);
        }
      }

      get(key: string): unknown {
        return electronStoreMocks.values.get(key);
      }

      set(key: string, value: unknown): void {
        electronStoreMocks.values.set(key, value);
      }
    },
  };
}

export function resetElectronStoreMocks(defaultKey: string): void {
  electronStoreMocks.values.clear();
  electronStoreMocks.values.set(defaultKey, []);
  electronStoreMocks.randomUUID.mockReturnValue(DEFAULT_RANDOM_UUID);
}
