import { setupWorker } from "msw/browser";

import { handlers } from "@/mocks/handlers";

const worker = setupWorker(...handlers);
let started = false;

export async function startMocking() {
  if (started) return;
  await worker.start({ onUnhandledRequest: "bypass", quiet: true });
  started = true;
}
