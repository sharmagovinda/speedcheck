"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Link2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type UrlCheckerFormValues, urlCheckerFormSchema } from "@/lib/validations/url";

interface UrlCheckerProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
  size?: "default" | "lg";
  className?: string;
  defaultValue?: string;
  submitLabel?: string;
}

export function UrlChecker({
  onSubmit,
  isLoading,
  size = "default",
  className,
  defaultValue,
  submitLabel = "Analyze Website",
}: UrlCheckerProps) {
  const form = useForm<UrlCheckerFormValues>({
    resolver: zodResolver(urlCheckerFormSchema),
    defaultValues: { url: defaultValue ?? "" },
  });

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values.url as string);
  });

  const errorMessage = form.formState.errors.url?.message;

  return (
    <form onSubmit={handleSubmit} noValidate className={cn("w-full", className)}>
      <div
        className={cn(
          "flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm sm:flex-row sm:items-center",
          errorMessage && "border-destructive/50",
        )}
      >
        <div className="flex flex-1 items-center gap-2 px-3 py-2">
          <Link2 className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            {...form.register("url")}
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="https://yourwebsite.com"
            aria-label="Website URL"
            aria-invalid={!!errorMessage}
            aria-describedby={errorMessage ? "url-checker-error" : undefined}
            disabled={isLoading}
            className={cn(
              "w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60",
              size === "lg" && "text-base sm:text-lg",
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={isLoading}
          className={cn("shrink-0", size === "lg" && "h-12 px-6 text-base")}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Analyzing…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
      <p
        id="url-checker-error"
        role="alert"
        aria-live="polite"
        className="mt-2 min-h-5 px-1 text-sm text-destructive"
      >
        {errorMessage ?? ""}
      </p>
    </form>
  );
}
