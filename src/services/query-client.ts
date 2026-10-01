import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./http-client";

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        networkMode: "always",
        retry: (count, error) =>
          count < 1 &&
          (!(error instanceof ApiError) ||
            error.status === 0 ||
            error.status >= 500),
        staleTime: 30_000,
        refetchOnWindowFocus: true,
      },
      mutations: { retry: 0, networkMode: "always" },
    },
  });
}
