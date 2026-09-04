import type { Strategy } from "@/lib/performance/types";

export interface ShareTarget {
  url: string;
  strategy: Strategy;
}

/**
 * Maps a short share id to the { url, strategy } that produced it, so
 * `/report/[id]` can regenerate the same deterministic mock report.
 *
 * This is a browser-only placeholder that only works for the browser
 * that generated the link. Replace with a database table
 * (id, url, strategy, created_at, owner_id) once persistence is
 * added — `/report/[id]` already reads through this interface only.
 */
const STORAGE_KEY = "speedcheck.shared-reports";

function readMap(): Record<string, ShareTarget> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, ShareTarget>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function registerShareTarget(id: string, target: ShareTarget) {
  const map = readMap();
  map[id] = target;
  writeMap(map);
}

export function getShareTarget(id: string): ShareTarget | null {
  return readMap()[id] ?? null;
}
