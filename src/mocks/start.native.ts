declare const require: (moduleId: string) => unknown;

const mockGlobal = globalThis as typeof globalThis & { __ohakkomNativeMswStart?: Promise<void> };

export function startMocking() {
  if (process.env.EXPO_PUBLIC_USE_MSW === "false") return Promise.resolve();

  mockGlobal.__ohakkomNativeMswStart ??= Promise.resolve().then(() => {
    require("./polyfills.native");

    const { setupServer } = require("msw/native") as typeof import("msw/native");
    const { handlers } = require("./handlers") as typeof import("./handlers");
    const server = setupServer(...handlers);

    server.listen({ onUnhandledRequest: "bypass" });
  });

  return mockGlobal.__ohakkomNativeMswStart;
}
