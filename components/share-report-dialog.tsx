"use client";

import * as React from "react";
import { Check, Copy, Download, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { exportReportAsPdf } from "@/lib/performance/pdf-export";
import type { PerformanceReport } from "@/lib/performance/types";
import { registerShareTarget } from "@/lib/storage/share-store";

interface ShareReportDialogProps {
  report: PerformanceReport;
}

export function ShareReportDialog({ report }: ShareReportDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [shareUrl, setShareUrl] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    registerShareTarget(report.id, { url: report.url, strategy: report.strategy });
    // Intentional: (re)compute the share link whenever the dialog opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShareUrl(`${window.location.origin}/report/${report.id}`);
    setCopied(false);
  }, [open, report.id, report.url, report.strategy]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link. Please copy it manually.");
    }
  };

  const handleDownloadPdf = async () => {
    setExporting(true);
    try {
      await exportReportAsPdf(report);
      toast.success("PDF downloaded");
    } catch {
      toast.info("PDF export isn't available yet — coming soon.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <Share2 className="size-4" aria-hidden="true" />
        Share Report
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this report</DialogTitle>
          <DialogDescription>
            Anyone with this link can view the {report.hostname} performance report.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input value={shareUrl} readOnly aria-label="Shareable report link" />
          <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy link">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </Button>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button variant="secondary" onClick={handleDownloadPdf} disabled={exporting}>
            <Download className="size-4" aria-hidden="true" />
            {exporting ? "Preparing…" : "Download PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
