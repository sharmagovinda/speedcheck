import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreRing } from "@/components/score-ring";
import type { AuditCheck } from "@/lib/performance/types";
import { cn } from "@/lib/utils";

const STATUS_ICON = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
} as const;

const STATUS_TEXT = {
  pass: "text-emerald-600 dark:text-emerald-400",
  warn: "text-amber-600 dark:text-amber-400",
  fail: "text-red-600 dark:text-red-400",
} as const;

interface AuditCheckListProps {
  id: string;
  title: string;
  description: string;
  score: number;
  checks: AuditCheck[];
}

export function AuditCheckList({ id, title, description, score, checks }: AuditCheckListProps) {
  return (
    <Card id={id} className="scroll-mt-24">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <ScoreRing score={score} label={title} size={92} className="shrink-0" />
      </CardHeader>
      <CardContent>
        <Accordion multiple className="w-full">
          {checks.map((check) => {
            const Icon = STATUS_ICON[check.status];
            return (
              <AccordionItem key={check.id} value={check.id}>
                <AccordionTrigger className="gap-3 py-3.5 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <Icon
                      className={cn("size-4 shrink-0", STATUS_TEXT[check.status])}
                      aria-hidden="true"
                    />
                    <span className="font-medium">{check.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-1.5 pl-7 text-sm text-muted-foreground">
                  <p>{check.description}</p>
                  {check.recommendation && (
                    <p className="font-medium text-foreground">
                      Recommendation: <span className="font-normal text-muted-foreground">{check.recommendation}</span>
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
