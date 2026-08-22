import type { Profile } from "@/types";
import {
  clearProgressInStorage,
  readActiveProfileId,
  readProfilesFromStorage,
  writeActiveProfileId,
  writeProfilesToStorage,
} from "@/lib/storage";

// Local-storage-backed implementation. Swap the bodies of these functions for
// Supabase/Firebase/database calls later without touching the UI — profiles
// are looked up the same way regardless of where they're actually stored.

export function getAllProfiles(): Profile[] {
  return readProfilesFromStorage<Profile>();
}

export function getProfileById(profileId: string): Profile | undefined {
  return getAllProfiles().find((p) => p.id === profileId);
}

export function createProfile(name: string, avatar: string): Profile {
  const profile: Profile = {
    id: `profile-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    name: name.trim(),
    avatar,
    createdAt: new Date().toISOString(),
  };
  writeProfilesToStorage([...getAllProfiles(), profile]);
  return profile;
}

export function deleteProfile(profileId: string): void {
  writeProfilesToStorage(getAllProfiles().filter((p) => p.id !== profileId));
  clearProgressInStorage(profileId);
  if (readActiveProfileId() === profileId) {
    writeActiveProfileId(null);
  }
}

export function getActiveProfileId(): string | null {
  return readActiveProfileId();
}

export function setActiveProfileId(profileId: string | null): void {
  writeActiveProfileId(profileId);
}
