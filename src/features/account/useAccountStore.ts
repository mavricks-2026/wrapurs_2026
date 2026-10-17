"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { demoCredentials } from "@/config/auth";
import { savedAddresses as defaultAddresses, type SavedAddress } from "@/config/checkout";

/**
 * useAccountStore — per-account profile overrides + saved address book.
 *
 * Keyed by the signed-in email so one browser can hold several accounts.
 * Persisted under `wrapurs-account`; swapped for Prisma columns in M10.
 */

export type AccountProfile = { name?: string; phone?: string };

type AccountState = {
  profiles: Record<string, AccountProfile>;
  addresses: Record<string, SavedAddress[]>;
  setProfile: (email: string, patch: AccountProfile) => void;
  addAddress: (email: string, address: SavedAddress) => void;
  updateAddress: (email: string, id: string, patch: Partial<SavedAddress>) => void;
  removeAddress: (email: string, id: string) => void;
  setDefaultAddress: (email: string, id: string) => void;
};

const key = (email: string) => email.trim().toLowerCase();
const DEMO_EMAIL = key(demoCredentials.email);

/**
 * Stable empty references — selectors must return the SAME reference between
 * renders or Zustand's `getServerSnapshot` loops forever (React error
 * "Maximum update depth exceeded").
 */
const EMPTY_PROFILE: AccountProfile = {};
const emptyAddressCache = new Map<string, SavedAddress[]>();

/** Seed list for a user who has never saved an address (the demo user gets the design's two). */
function seedAddresses(email: string): SavedAddress[] {
  const k = key(email);
  if (k === DEMO_EMAIL) return defaultAddresses;
  let cached = emptyAddressCache.get(k);
  if (!cached) {
    cached = [];
    emptyAddressCache.set(k, cached);
  }
  return cached;
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      profiles: {},
      addresses: {},
      setProfile: (email, patch) =>
        set((state) => {
          const k = key(email);
          return { profiles: { ...state.profiles, [k]: { ...state.profiles[k], ...patch } } };
        }),
      addAddress: (email, address) =>
        set((state) => {
          const k = key(email);
          const current = state.addresses[k] ?? seedAddresses(k);
          return { addresses: { ...state.addresses, [k]: [...current, address] } };
        }),
      updateAddress: (email, id, patch) =>
        set((state) => {
          const k = key(email);
          const current = state.addresses[k] ?? seedAddresses(k);
          return {
            addresses: {
              ...state.addresses,
              [k]: current.map((a) => (a.id === id ? { ...a, ...patch } : a)),
            },
          };
        }),
      removeAddress: (email, id) =>
        set((state) => {
          const k = key(email);
          const current = state.addresses[k] ?? seedAddresses(k);
          return { addresses: { ...state.addresses, [k]: current.filter((a) => a.id !== id) } };
        }),
      setDefaultAddress: (email, id) =>
        set((state) => {
          const k = key(email);
          const current = state.addresses[k] ?? seedAddresses(k);
          const target = current.find((a) => a.id === id);
          if (!target) return state;
          const rest = current.filter((a) => a.id !== id);
          return { addresses: { ...state.addresses, [k]: [target, ...rest] } };
        }),
    }),
    { name: "wrapurs-account" },
  ),
);

/** Addresses for a user — their stored list, else the demo seed, else a stable []. Guests get the demo set. */
export function resolveAddresses(
  state: AccountState,
  email: string | null | undefined,
): SavedAddress[] {
  if (!email) return defaultAddresses;
  const k = key(email);
  return state.addresses[k] ?? seedAddresses(k);
}

/** Profile overrides for a user (name / phone), or a stable empty object. */
export function resolveProfile(
  state: AccountState,
  email: string | null | undefined,
): AccountProfile {
  if (!email) return EMPTY_PROFILE;
  return state.profiles[key(email)] ?? EMPTY_PROFILE;
}
