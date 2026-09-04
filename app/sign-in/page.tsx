import type { Metadata } from "next";
import Link from "next/link";
import { Gauge } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your SpeedCheck account.",
};

export default function SignInPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 sm:px-6">
      <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-teal-400 text-white">
        <Gauge className="size-6" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Sign in to SpeedCheck</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Accounts aren&apos;t required to analyze a website — sign-in is coming soon for teams
        that want saved history and shared dashboards across devices.
      </p>

      <Card className="mt-8 w-full">
        <CardContent className="space-y-4 px-6 py-6">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@company.com" disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" disabled />
          </div>
          <Button className="w-full" disabled>
            Sign In (coming soon)
          </Button>
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-muted-foreground">
        Want to try it now?{" "}
        <Link href="/check" className="font-medium text-foreground hover:underline">
          Analyze a website
        </Link>{" "}
        without an account.
      </p>
    </div>
  );
}
