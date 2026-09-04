import { FileCode, FileText, File as FileIcon, Image as ImageIcon, Palette, Type, Zap } from "lucide-react";
import type { ComponentType } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes, formatMs } from "@/lib/format";
import type { Opportunity, OpportunityResourceImpact, Severity } from "@/lib/performance/types";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<Severity, string> = {
  high: "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  medium:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  low: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
};

const SEVERITY_LABEL: Record<Severity, string> = {
  high: "High impact",
  medium: "Medium impact",
  low: "Low impact",
};

const RESOURCE_TYPE_STYLE: Record<
  OpportunityResourceImpact["type"],
  { icon: ComponentType<{ className?: string }>; swatch: string }
> = {
  JS: { icon: FileCode, swatch: "bg-series-js" },
  CSS: { icon: Palette, swatch: "bg-series-css" },
  Image: { icon: ImageIcon, swatch: "bg-series-images" },
  Font: { icon: Type, swatch: "bg-series-fonts" },
  HTML: { icon: FileText, swatch: "bg-series-html" },
  Other: { icon: FileIcon, swatch: "bg-series-other" },
};

function AffectedResourceRow({ resource }: { resource: OpportunityResourceImpact }) {
  const { icon: Icon, swatch } = RESOURCE_TYPE_STYLE[resource.type];
  return (
    <li className="flex items-center justify-between gap-4 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md text-white",
            swatch,
          )}
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </span>
        <span className="truncate text-sm font-medium">{resource.name}</span>
      </div>
      <div className="flex shrink-0 items-center gap-4 text-sm tabular-nums">
        <span className="text-muted-foreground">{formatBytes(resource.bytes)}</span>
        <span className="w-20 text-right font-medium text-emerald-600 dark:text-emerald-400">
          {resource.savingsBytes ? `-${formatBytes(resource.savingsBytes)}` : "—"}
        </span>
      </div>
    </li>
  );
}

interface OpportunitiesProps {
  opportunities: Opportunity[];
}

export function Opportunities({ opportunities }: OpportunitiesProps) {
  if (opportunities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No significant optimization opportunities were found. Great job!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Opportunities</CardTitle>
        <p className="text-sm text-muted-foreground">
          Suggestions to help your page load faster — expand any item for why it&apos;s happening
          and how to fix it.
        </p>
      </CardHeader>
      <CardContent>
        <Accordion multiple className="w-full">
          {opportunities.map((opportunity) => (
            <AccordionItem key={opportunity.id} value={opportunity.id}>
              <AccordionTrigger className="gap-4 py-4 hover:no-underline">
                <div className="flex flex-1 flex-col gap-2 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="flex items-start gap-3">
                    <Zap
                      className="mt-0.5 size-4 shrink-0 text-amber-500"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-medium leading-snug">{opportunity.title}</p>
                      <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 pl-7 sm:pl-0">
                    <Badge
                      variant="outline"
                      className={cn("border", SEVERITY_STYLES[opportunity.severity])}
                    >
                      {SEVERITY_LABEL[opportunity.severity]}
                    </Badge>
                    <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                      -{formatMs(opportunity.savingsMs)}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-5 pl-7 text-sm">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Why this happens
                  </p>
                  <p className="mt-1.5 text-muted-foreground">{opportunity.whyItHappens}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    How to fix it
                  </p>
                  <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-muted-foreground marker:text-foreground/60">
                    {opportunity.howToFix.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>

                {opportunity.affectedResources.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Affected resources
                    </p>
                    <ul className="mt-1.5 divide-y divide-border rounded-lg border border-border px-3">
                      {opportunity.affectedResources.map((resource) => (
                        <AffectedResourceRow key={resource.name} resource={resource} />
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Icons represent the resource type — SpeedCheck&apos;s mock analyzer
                      doesn&apos;t capture real page screenshots yet, only estimated size and
                      savings per file.
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
