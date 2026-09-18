export function formatRelativeTime(isoDate: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(isoDate)) / 60_000));

  if (minutes < 60) return "baru saja";

  const hours = Math.round(minutes / 60);
  if (hours === 1) return "1 jam lalu";
  if (hours < 24) return `${hours} jam lalu`;
  if (hours < 48) return "kemarin";

  return `${Math.round(hours / 24)} hari lalu`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
