import type { PerformanceReport } from "./types";

/**
 * Placeholder PDF export. Swap the body of this function for a real
 * implementation later — e.g. rendering a print-optimized report view
 * and rasterizing it server-side (Puppeteer/Playwright), or generating
 * a PDF directly with a library like `@react-pdf/renderer`. The
 * calling UI (`share-report-dialog.tsx`) already awaits this call and
 * handles success/failure, so no UI changes are needed when this is
 * implemented for real.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- placeholder signature for the future real implementation
export async function exportReportAsPdf(_report: PerformanceReport): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  throw new Error("PDF export isn't available yet.");
}
