import type { PerformanceReport, Strategy } from "@/lib/performance/types";

export interface ReportSummary {
  id: string;
  url: string;
  hostname: string;
  strategy: Strategy;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  fetchedAt: string;
}

/**
 * Storage abstraction for report history. The UI (dashboard, hooks)
 * depends only on this interface. `LocalReportHistoryStore` below is
 * a browser-only placeholder — swap it for a Supabase/PostgreSQL
 * backed implementation (keyed by user id) without touching any
 * component.
 */
export interface ReportHistoryStore {
  list(): Promise<ReportSummary[]>;
  save(summary: ReportSummary): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

const STORAGE_KEY = "speedcheck.report-history";
const MAX_ENTRIES = 20;

function readAll(): ReportSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: ReportSummary[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export const localReportHistoryStore: ReportHistoryStore = {
  async list() {
    return readAll().sort(
      (a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime(),
    );
  },
  async save(summary) {
    const entries = readAll().filter(
      (e) => !(e.hostname === summary.hostname && e.strategy === summary.strategy),
    );
    entries.unshift(summary);
    writeAll(entries.slice(0, MAX_ENTRIES));
  },
  async remove(id) {
    writeAll(readAll().filter((e) => e.id !== id));
  },
  async clear() {
    writeAll([]);
  },
};

export function toSummary(report: PerformanceReport): ReportSummary {
  return {
    id: report.id,
    url: report.url,
    hostname: report.hostname,
    strategy: report.strategy,
    performance: report.performance,
    accessibility: report.accessibility,
    bestPractices: report.bestPractices,
    seo: report.seo,
    fetchedAt: report.fetchedAt,
  };
}
