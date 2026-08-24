import { setupServer } from "msw/native";

import { handlers } from "@/mocks/handlers";

const server = setupServer(...handlers);
let started = false;

export async function startMocking() {
  if (started) return;
  server.listen({ onUnhandledRequest: "bypass" });
  started = true;
}
