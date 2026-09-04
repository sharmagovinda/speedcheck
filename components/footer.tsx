import Link from "next/link";
import { Gauge } from "lucide-react";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Website Checker", href: "/check" },
      { label: "Compare Sites", href: "/compare" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Sign In", href: "/sign-in" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-teal-400 text-white">
                <Gauge className="size-4.5" aria-hidden="true" />
              </span>
              <span className="text-lg">SpeedCheck</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Free website speed checker that analyzes performance, Core Web Vitals, SEO,
              accessibility, and best practices in seconds.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SpeedCheck. All rights reserved.</p>
          <p>Created by Govinda Sharma</p>
        </div>
      </div>
    </footer>
  );
}
