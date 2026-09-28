export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

type Options = {
  baseUrl: string;
  getToken: () => Promise<string | null>;
  onUnauthorized: () => Promise<void>;
  scenario?: () => string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

export function createApiClient(options: Options) {
  return async function request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (init.body) headers.set("Content-Type", "application/json");
    const isAuth = path.startsWith("/auth/");
    const token = isAuth ? null : await options.getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (options.scenario) headers.set("x-ohakkom-scenario", options.scenario());
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      options.timeoutMs ?? 15000,
    );
    try {
      const response = await (options.fetcher ?? fetch)(
        `${options.baseUrl.replace(/\/$/, "")}${path}`,
        { ...init, headers, signal: controller.signal },
      );
      const raw = await response.text();
      let data: unknown = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        /* Error proxies may return HTML. */
      }
      if (!response.ok) {
        // A late response from a previous account must not log out a new session.
        if (
          response.status === 401 &&
          !isAuth &&
          token === (await options.getToken())
        )
          await options.onUnauthorized();
        const message =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "요청을 처리하지 못했어요. 다시 시도해 주세요.";
        throw new ApiError(message, response.status);
      }
      if (raw && data === null)
        throw new ApiError(
          "서버 응답 형식을 확인할 수 없어요.",
          response.status,
        );
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        controller.signal.aborted
          ? "서버 응답 시간이 초과됐어요. 처리 상태를 확인한 뒤 다시 시도해 주세요."
          : "서버에 연결할 수 없어요. 연결 상태를 확인해 주세요.",
        0,
      );
    } finally {
      clearTimeout(timer);
    }
  };
}
