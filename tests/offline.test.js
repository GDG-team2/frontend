import { expect, test } from "bun:test";
import { onlineManager } from "@tanstack/react-query";
import { createAppQueryClient } from "../src/services/query-client";
import { ApiError } from "../src/services/http-client";

test("offline reads fail visibly and writes are never queued until reconnection", async () => {
  const client = createAppQueryClient();
  onlineManager.setOnline(false);
  let attempted = 0;
  try {
    const fail = async () => {
      attempted++;
      throw new ApiError("offline", 0);
    };
    await expect(
      client.fetchQuery({ queryKey: ["offline"], queryFn: fail, retry: false }),
    ).rejects.toThrow("offline");
    const mutation = client
      .getMutationCache()
      .build(client, { mutationFn: fail });
    await expect(mutation.execute()).rejects.toThrow("offline");
    expect(attempted).toBe(2);
    expect(mutation.state.isPaused).toBe(false);
    onlineManager.setOnline(true);
    await client.resumePausedMutations();
    expect(attempted).toBe(2);
  } finally {
    onlineManager.setOnline(true);
    client.clear();
  }
});
