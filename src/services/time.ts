// The backend sends timezone-less Korea timestamps. Never parse them as device-local time.
export function parseKoreaTime(value: string): number {
  return Date.parse(
    /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}+09:00`,
  );
}

export function toKoreaTime(value: number | Date): string {
  return new Date(Number(value) + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 19);
}

export function formatKoreaTime(value?: string): string {
  if (!value) return "—";
  const timestamp = parseKoreaTime(value);
  if (!Number.isFinite(timestamp)) return "—";
  const korea = toKoreaTime(timestamp);
  return `${korea.slice(0, 10).replaceAll("-", ".")} ${korea.slice(11, 16)}`;
}

export function validDeparture(value: string, now = Date.now()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)) return false;
  const timestamp = parseKoreaTime(value);
  return (
    Number.isFinite(timestamp) &&
    toKoreaTime(timestamp).slice(0, 16) === value.slice(0, 16) &&
    timestamp > now &&
    timestamp <= now + 14 * 24 * 60 * 60 * 1000
  );
}
