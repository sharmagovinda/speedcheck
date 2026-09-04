"use client";

import * as React from "react";

import { localReportHistoryStore, type ReportSummary } from "@/lib/storage/report-history";

export function useReportHistory() {
  const [reports, setReports] = React.useState<ReportSummary[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  const refresh = React.useCallback(async () => {
    const list = await localReportHistoryStore.list();
    setReports(list);
    setLoaded(true);
  }, []);

  React.useEffect(() => {
    // Intentional: load report history from localStorage on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const remove = React.useCallback(
    async (id: string) => {
      await localReportHistoryStore.remove(id);
      await refresh();
    },
    [refresh],
  );

  const clear = React.useCallback(async () => {
    await localReportHistoryStore.clear();
    await refresh();
  }, [refresh]);

  return { reports, loaded, refresh, remove, clear };
}
