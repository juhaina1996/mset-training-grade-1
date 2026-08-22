"use client";

import { useState } from "react";
import { useProgress } from "@/context/ProgressProvider";

const AVATAR_CHOICES = ["🦄", "🐯", "🐼", "🦊", "🐸", "🐵", "🦁", "🐶", "🐱", "🐨", "🐰", "🐧"];

export function ProfilePicker() {
  const { profiles, switchProfile, createProfile, deleteProfile } = useProgress();
  const [isAdding, setIsAdding] = useState(profiles.length === 0);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATAR_CHOICES[0]);

  function handleCreate() {
    if (!name.trim()) return;
    createProfile(name, avatar);
  }

  function handleDelete(profileId: string, profileName: string) {
    if (window.confirm(`Remove ${profileName}'s profile and all their progress?`)) {
      deleteProfile(profileId);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-2xl flex-col items-center justify-center gap-8 px-4 py-10">
      <div className="text-center">
        <span className="text-6xl">🎓</span>
        <h1 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-50">
          Who&apos;s practicing today?
        </h1>
        <p className="mt-1 text-lg text-slate-500 dark:text-slate-400">
          Pick your name or add a new player.
        </p>
      </div>

      {profiles.length > 0 && (
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
          {profiles.map((profile) => (
            <div key={profile.id} className="relative">
              <button
                type="button"
                onClick={() => switchProfile(profile.id)}
                className="flex min-h-[8rem] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white p-4 text-center shadow-sm transition active:bg-indigo-50 sm:hover:border-indigo-400 sm:hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:sm:hover:bg-slate-700"
              >
                <span className="text-5xl">{profile.avatar}</span>
                <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{profile.name}</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(profile.id, profile.name)}
                aria-label={`Remove ${profile.name}`}
                className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-600 shadow transition active:bg-rose-200 dark:bg-slate-700 dark:text-slate-300"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {!isAdding ? (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex min-h-[3.5rem] w-full items-center justify-center rounded-2xl border-2 border-dashed border-indigo-300 px-6 text-lg font-bold text-indigo-600 transition active:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400"
        >
          + Add New Player
        </button>
      ) : (
        <div className="flex w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <label className="flex flex-col gap-2">
            <span className="text-base font-semibold text-slate-700 dark:text-slate-200">Your name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type your name"
              maxLength={20}
              className="min-h-[3.25rem] rounded-xl border-2 border-slate-200 bg-white px-4 text-lg text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-50"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-base font-semibold text-slate-700 dark:text-slate-200">
              Pick your avatar
            </span>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_CHOICES.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => setAvatar(choice)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition ${
                    avatar === choice
                      ? "bg-indigo-100 ring-2 ring-indigo-500 dark:bg-indigo-900/40"
                      : "bg-slate-100 active:bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim()}
            className="mt-1 flex min-h-[3.5rem] items-center justify-center rounded-2xl bg-indigo-600 px-6 text-lg font-bold text-white transition active:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50 sm:hover:bg-indigo-700"
          >
            Start Practicing
          </button>
        </div>
      )}
    </div>
  );
}
