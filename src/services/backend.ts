import { apiRequest } from "./api";
import { createBackend } from "./backend-client";
export const backend = createBackend(apiRequest);
