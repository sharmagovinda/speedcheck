import { z } from "zod";

/**
 * Normalizes user input into a fully-qualified URL: trims whitespace
 * and prepends `https://` when no protocol was given.
 */
export function withProtocol(value: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function hasValidHostname(value: string): boolean {
  try {
    const { hostname } = new URL(value);
    // require at least one dot (rejects "https://a", "https://localhost"
    // typed as a bare word) — real SSRF/hostname safety is enforced
    // server-side in lib/security/url-guard.ts
    return hostname.includes(".") && hostname.length > 3;
  } catch {
    return false;
  }
}

export const websiteUrlSchema = z
  .string()
  .min(1, "Please enter a website URL.")
  .transform(withProtocol)
  .pipe(
    z
      .string()
      .url("Please enter a valid website URL.")
      .refine(hasValidHostname, "Please enter a valid website URL."),
  );

export const strategySchema = z.enum(["mobile", "desktop"]);

export const analyzeRequestSchema = z.object({
  url: websiteUrlSchema,
  strategy: strategySchema.default("mobile"),
});

export type AnalyzeRequestInput = z.input<typeof analyzeRequestSchema>;
export type AnalyzeRequestOutput = z.output<typeof analyzeRequestSchema>;

export const urlCheckerFormSchema = z.object({
  url: websiteUrlSchema,
});

export type UrlCheckerFormValues = z.input<typeof urlCheckerFormSchema>;
