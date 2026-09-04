"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { websiteUrlSchema } from "@/lib/validations/url";

const compareFormSchema = z.object({
  urlA: websiteUrlSchema,
  urlB: websiteUrlSchema,
});

export type CompareFormValues = z.input<typeof compareFormSchema>;

interface CompareFormProps {
  onSubmit: (values: { urlA: string; urlB: string }) => void;
  isLoading?: boolean;
  defaultValues?: { urlA?: string; urlB?: string };
}

export function CompareForm({ onSubmit, isLoading, defaultValues }: CompareFormProps) {
  const form = useForm<CompareFormValues>({
    resolver: zodResolver(compareFormSchema),
    defaultValues: { urlA: defaultValues?.urlA ?? "", urlB: defaultValues?.urlB ?? "" },
  });

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({ urlA: values.urlA as string, urlB: values.urlB as string });
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="urlA">Website A</Label>
          <Input
            id="urlA"
            placeholder="https://example.com"
            disabled={isLoading}
            aria-invalid={!!form.formState.errors.urlA}
            {...form.register("urlA")}
          />
          <p className="min-h-4 text-xs text-destructive">{form.formState.errors.urlA?.message}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="urlB">Website B</Label>
          <Input
            id="urlB"
            placeholder="https://competitor.com"
            disabled={isLoading}
            aria-invalid={!!form.formState.errors.urlB}
            {...form.register("urlB")}
          />
          <p className="min-h-4 text-xs text-destructive">{form.formState.errors.urlB?.message}</p>
        </div>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Comparing…
          </>
        ) : (
          <>
            <ArrowRightLeft className="size-4" aria-hidden="true" />
            Compare Websites
          </>
        )}
      </Button>
    </form>
  );
}
