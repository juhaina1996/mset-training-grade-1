const PROFILES_KEY = "mset:profiles:v1";
const ACTIVE_PROFILE_KEY = "mset:activeProfileId:v1";

function progressKey(profileId: string): string {
  return `mset:studentProgress:v1:${profileId}`;
}

function readFromStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable (private browsing, quota exceeded) — fail silently.
  }
}

function removeFromStorage(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

export function readProfilesFromStorage<T>(): T[] {
  return readFromStorage<T[]>(PROFILES_KEY) ?? [];
}

export function writeProfilesToStorage<T>(profiles: T[]): void {
  writeToStorage(PROFILES_KEY, profiles);
}

export function readActiveProfileId(): string | null {
  return readFromStorage<string>(ACTIVE_PROFILE_KEY);
}

export function writeActiveProfileId(id: string | null): void {
  if (id === null) {
    removeFromStorage(ACTIVE_PROFILE_KEY);
  } else {
    writeToStorage(ACTIVE_PROFILE_KEY, id);
  }
}

export function readProgressFromStorage<T>(profileId: string): T | null {
  return readFromStorage<T>(progressKey(profileId));
}

export function writeProgressToStorage<T>(profileId: string, value: T): void {
  writeToStorage(progressKey(profileId), value);
}

export function clearProgressInStorage(profileId: string): void {
  removeFromStorage(progressKey(profileId));
}
