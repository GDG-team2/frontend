const mockGlobal = globalThis as typeof globalThis & {
  __ohakkomWebMswStart?: Promise<void>;
};

export async function startMocking() {
  if (
    typeof window === "undefined" ||
    process.env.EXPO_PUBLIC_USE_MSW !== "true"
  )
    return;
  mockGlobal.__ohakkomWebMswStart ??= (async () => {
    const { setupWorker } = await import("msw/browser");
    const { handlers } = await import("./handlers");
    const worker = setupWorker(...handlers);
    await worker.start({ onUnhandledRequest: "bypass", quiet: true });
  })();
  await mockGlobal.__ohakkomWebMswStart;
}
