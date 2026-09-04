"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderSearch, Trash } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { ReportHistory } from "@/components/report-history";
import { Skeleton } from "@/components/ui/skeleton";
import { useReportHistory } from "@/hooks/use-report-history";
import type { ReportSummary } from "@/lib/storage/report-history";

export default function DashboardPage() {
  const router = useRouter();
  const { reports, loaded, remove, clear } = useReportHistory();

  const handleDelete = async (id: string) => {
    await remove(id);
    toast.success("Report removed");
  };

  const handleRerun = (summary: ReportSummary) => {
    router.push(`/results?url=${encodeURIComponent(summary.url)}&strategy=${summary.strategy}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Recent Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Websites you&apos;ve analyzed, stored locally in this browser.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {reports.length > 0 && (
            <Button
              variant="outline"
              onClick={async () => {
                await clear();
                toast.success("Report history cleared");
              }}
            >
              <Trash className="size-4" aria-hidden="true" />
              Clear all
            </Button>
          )}
          <Button render={<Link href="/check" />} nativeButton={false}>
            Analyze Website
          </Button>
        </div>
      </div>

      <div className="py-8">
        {!loaded && (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        )}

        {loaded && reports.length === 0 && (
          <EmptyState
            icon={FolderSearch}
            title="No reports yet"
            description="Analyze your first website to see your performance report."
            action={
              <Button render={<Link href="/check" />} nativeButton={false}>
                Analyze Website
              </Button>
            }
          />
        )}

        {loaded && reports.length > 0 && (
          <ReportHistory reports={reports} onDelete={handleDelete} onRerun={handleRerun} />
        )}
      </div>
    </div>
  );
}
