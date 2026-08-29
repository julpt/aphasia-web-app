const PREFIX = 'seenExercises_';

export function getSeenIds(type: string): string[] {
  const raw = sessionStorage.getItem(PREFIX + type);
  return raw ? JSON.parse(raw) : [];
}

export function addSeenId(type: string, id: string): void {
  const current = getSeenIds(type);
  if (!current.includes(id)) {
    sessionStorage.setItem(PREFIX + type, JSON.stringify([...current, id]));
  }
}

export function clearSeenIds(type: string): void {
  sessionStorage.removeItem(PREFIX + type);
}