export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

type Options = {
  baseUrl: string;
  getToken: () => Promise<string | null>;
  getSessionVersion?: () => number;
  onUnauthorized: (token: string | null) => Promise<void>;
  refreshSession?: (expiredToken: string) => Promise<string | null>;
  scenario?: () => string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

export function createApiClient(options: Options) {
  let refreshing:
    { token: string; promise: Promise<string | null> } | undefined;
  return async function request<T>(
    path: string,
    init: RequestInit = {},
    retried = false,
    sessionVersion = options.getSessionVersion?.(),
  ): Promise<T> {
    const checkSession = () => {
      if (
        !path.startsWith("/auth/") &&
        options.getSessionVersion?.() !== sessionVersion
      )
        throw new ApiError(
          "로그인 상태가 바뀌었어요. 다시 시도해 주세요.",
          409,
          "SESSION_CHANGED",
        );
    };
    checkSession();
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (init.body) headers.set("Content-Type", "application/json");
    const isAuth = path.startsWith("/auth/");
    const token = isAuth ? null : await options.getToken();
    checkSession();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (options.scenario) headers.set("x-ohakkom-scenario", options.scenario());
    const controller = new AbortController();
    const abort = () => controller.abort();
    if (init.signal?.aborted) abort();
    else init.signal?.addEventListener("abort", abort, { once: true });
    // The deployed development server can take a minute to wake up.
    const timer = setTimeout(abort, options.timeoutMs ?? 90000);
    try {
      const response = await (options.fetcher ?? fetch)(
        `${options.baseUrl.replace(/\/$/, "")}${path}`,
        { ...init, headers, signal: controller.signal },
      );
      const raw = await response.text();
      checkSession();
      let data: unknown = null;
      let parsed = true;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch {
        parsed = false;
      }
      if (!response.ok) {
        const payload =
          data && typeof data === "object"
            ? (data as Record<string, unknown>)
            : {};
        const code =
          typeof payload.code === "string" ? payload.code : undefined;
        if (
          response.status === 401 &&
          code === "TOKEN_EXPIRED" &&
          !isAuth &&
          token &&
          !retried &&
          options.refreshSession
        ) {
          let next = await options.getToken();
          if (next === token) {
            if (!refreshing || refreshing.token !== token) {
              const pending = { token, promise: options.refreshSession(token) };
              refreshing = pending;
              void pending.promise
                .finally(() => {
                  if (refreshing === pending) refreshing = undefined;
                })
                .catch(() => undefined);
            }
            next = await refreshing.promise;
          }
          checkSession();
          if (next) return request<T>(path, init, true, sessionVersion);
        }
        // A late response from a previous account must not log out a new session.
        if (
          (response.status === 401 || code === "USER_NOT_FOUND") &&
          !isAuth &&
          token === (await options.getToken())
        )
          await options.onUnauthorized(token);
        const message =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "요청을 처리하지 못했어요. 다시 시도해 주세요.";
        throw new ApiError(
          message,
          response.status,
          code,
          payload.details && typeof payload.details === "object"
            ? (payload.details as Record<string, unknown>)
            : undefined,
        );
      }
      if (!parsed)
        throw new ApiError(
          "서버 응답 형식을 확인할 수 없어요.",
          response.status,
        );
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        init.signal?.aborted
          ? "요청을 취소했어요."
          : controller.signal.aborted
            ? "서버 응답 시간이 초과됐어요. 처리 상태를 확인한 뒤 다시 시도해 주세요."
            : "서버에 연결할 수 없어요. 연결 상태를 확인해 주세요.",
        0,
        init.signal?.aborted
          ? "REQUEST_ABORTED"
          : controller.signal.aborted
            ? "TIMEOUT"
            : "NETWORK_ERROR",
      );
    } finally {
      clearTimeout(timer);
      init.signal?.removeEventListener("abort", abort);
    }
  };
}
