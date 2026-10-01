export type Session = { accessToken: string; refreshToken: string };
type Storage = {
  read: () => Promise<string | null>;
  write: (value: string) => Promise<void>;
  remove: () => Promise<void>;
};

// Serialize local changes so logout cannot be undone by an in-flight refresh.
export function createSessionManager(storage: Storage) {
  let queue: Promise<unknown> = Promise.resolve();
  let version = 0;
  function locked<T>(work: () => Promise<T>): Promise<T> {
    const next = queue.then(work);
    queue = next.catch(() => undefined);
    return next;
  }
  async function read(): Promise<Session | null> {
    const raw = await storage.read();
    if (!raw) return null;
    try {
      const session = JSON.parse(raw);
      return typeof session.accessToken === "string" &&
        session.accessToken &&
        typeof session.refreshToken === "string" &&
        session.refreshToken
        ? session
        : null;
    } catch {
      return null;
    }
  }
  return {
    version: () => version,
    get: () => locked(read),
    save: (session: Session) =>
      locked(() => {
        version++;
        return storage.write(JSON.stringify(session));
      }),
    clear: () =>
      locked(() => {
        version++;
        return storage.remove();
      }),
    invalidate: (accessToken: string | null) =>
      locked(async () => {
        const current = await read();
        if ((current?.accessToken ?? null) !== accessToken) return false;
        version++;
        await storage.remove();
        return true;
      }),
    replace: (expected: Session, next: Session) =>
      locked(async () => {
        const current = await read();
        if (
          current?.accessToken !== expected.accessToken ||
          current?.refreshToken !== expected.refreshToken
        )
          return null;
        await storage.write(JSON.stringify(next));
        return next.accessToken;
      }),
  };
}
