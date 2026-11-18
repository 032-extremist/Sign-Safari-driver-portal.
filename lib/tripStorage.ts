const STORAGE_KEY = 'signsafari-trip-names';

export function defaultTripName(tripId: string) {
  return `Safari trip ${tripId.slice(0, 6).toUpperCase()}`;
}

export function getTripName(tripId: string) {
  if (typeof window === 'undefined') {
    return defaultTripName(tripId);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const entries = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    return entries[tripId] || defaultTripName(tripId);
  } catch {
    return defaultTripName(tripId);
  }
}

export function setTripName(tripId: string, tripName: string) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const entries = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    const next = { ...entries, [tripId]: tripName.trim() || defaultTripName(tripId) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore storage issues in environments without localStorage.
  }
}
