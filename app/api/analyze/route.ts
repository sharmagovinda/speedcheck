import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { AnalysisTimeoutError, analyzeUrl } from "@/lib/performance/analyzer";
import { UnsafeUrlError } from "@/lib/security/url-guard";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { analyzeRequestSchema } from "@/lib/validations/url";

export const runtime = "nodejs";

function clientKey(req: NextRequest): string {
  // In production, prefer a header set by your trusted proxy/CDN
  // (e.g. `x-real-ip`) over a client-supplied one.
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
}

export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(clientKey(req));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMITED",
          message: "You've reached the analysis limit. Please try again later.",
        },
      },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_BODY", message: "Request body must be JSON." } },
      { status: 400 },
    );
  }

  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_URL",
          message: "Please enter a valid website URL.",
          issues: (parsed.error as ZodError).issues,
        },
      },
      { status: 400 },
    );
  }

  try {
    const report = await analyzeUrl(parsed.data);
    return NextResponse.json({ success: true, report });
  } catch (error) {
    if (error instanceof UnsafeUrlError) {
      return NextResponse.json(
        { success: false, error: { code: "UNSAFE_URL", message: error.message } },
        { status: 400 },
      );
    }
    if (error instanceof AnalysisTimeoutError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TIMEOUT",
            message: "Something went wrong while analyzing this website.",
          },
        },
        { status: 504 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ANALYSIS_FAILED",
          message: "Something went wrong while analyzing this website.",
        },
      },
      { status: 500 },
    );
  }
}
