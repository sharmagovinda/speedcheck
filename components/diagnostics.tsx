import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Diagnostic } from "@/lib/performance/types";
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

interface DiagnosticsProps {
  diagnostics: Diagnostic[];
}

export function Diagnostics({ diagnostics }: DiagnosticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Diagnostics</CardTitle>
        <p className="text-sm text-muted-foreground">
          Additional information about the performance of your application.
        </p>
      </CardHeader>
      <CardContent>
        <Accordion multiple className="w-full">
          {diagnostics.map((diagnostic) => {
            const Icon = STATUS_ICON[diagnostic.status];
            return (
              <AccordionItem key={diagnostic.id} value={diagnostic.id}>
                <AccordionTrigger className="gap-3 py-3.5 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <Icon
                      className={cn("size-4 shrink-0", STATUS_TEXT[diagnostic.status])}
                      aria-hidden="true"
                    />
                    <span className="font-medium">{diagnostic.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-7 text-sm text-muted-foreground">
                  {diagnostic.details}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
