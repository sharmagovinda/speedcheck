import { createRng, hashString } from "./random";
import { metricStatus } from "./thresholds";
import type {
  AuditCheck,
  CheckStatus,
  CoreWebVitals,
  Diagnostic,
  MetricKey,
  MetricRating,
  Opportunity,
  OpportunityResourceImpact,
  PerformanceAnalyzer,
  PerformanceReport,
  ResourceCategory,
  ResourceCategoryBreakdown,
  ResourceEntry,
  Severity,
  Strategy,
  TimelineEvent,
} from "./types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals = 0) {
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}

const METRIC_META: Record<
  MetricKey,
  { label: string; fullName: string; unit: MetricRating["unit"]; description: string }
> = {
  lcp: {
    label: "LCP",
    fullName: "Largest Contentful Paint",
    unit: "s",
    description: "Time until the largest visible element finishes rendering.",
  },
  inp: {
    label: "INP",
    fullName: "Interaction to Next Paint",
    unit: "ms",
    description: "Responsiveness to user interactions throughout the page lifecycle.",
  },
  cls: {
    label: "CLS",
    fullName: "Cumulative Layout Shift",
    unit: "",
    description: "Measures visual stability and unexpected layout movement.",
  },
  fcp: {
    label: "FCP",
    fullName: "First Contentful Paint",
    unit: "s",
    description: "Time until the first piece of content is painted on screen.",
  },
  ttfb: {
    label: "TTFB",
    fullName: "Time to First Byte",
    unit: "ms",
    description: "Time until the server returns the first byte of the response.",
  },
  speedIndex: {
    label: "Speed Index",
    fullName: "Speed Index",
    unit: "s",
    description: "How quickly content is visually displayed during page load.",
  },
};

function buildMetric(key: MetricKey, value: number): MetricRating {
  return {
    key,
    label: METRIC_META[key].label,
    fullName: METRIC_META[key].fullName,
    unit: METRIC_META[key].unit,
    description: METRIC_META[key].description,
    value,
    status: metricStatus(key, value),
  };
}

type OpportunityResourceType = ResourceEntry["type"];

const OPPORTUNITY_TEMPLATES: Array<{
  id: string;
  title: string;
  description: string;
  whyItHappens: string;
  howToFix: string[];
  baseSavingsMs: number;
  resourceTypes: OpportunityResourceType[];
  /** Fraction of matched resources' bytes this fix would typically save. */
  savingsFactor?: number;
}> = [
  {
    id: "render-blocking",
    title: "Eliminate render-blocking resources",
    description: "Your CSS and JavaScript files are delaying the first paint of the page.",
    whyItHappens:
      "These CSS and JavaScript files are loaded synchronously in the document head, so the browser must pause rendering and wait for them to download and execute before it can paint anything on screen.",
    howToFix: [
      "Inline the small amount of CSS needed for the first paint directly in the <head>.",
      "Add the `defer` or `async` attribute to <script> tags that aren't needed immediately.",
      "Load non-critical stylesheets asynchronously (preload + swap the media type on load).",
    ],
    baseSavingsMs: 1200,
    resourceTypes: ["CSS", "JS"],
  },
  {
    id: "resize-images",
    title: "Properly size images",
    description: "Some images are served larger than they are displayed.",
    whyItHappens:
      "These images are encoded at a much higher resolution than the space they're actually displayed in, so the browser downloads far more pixel data than it can show.",
    howToFix: [
      "Resize source images to match their maximum rendered dimensions.",
      "Use a responsive `srcset` and `sizes` so smaller viewports request smaller files.",
      "Serve images through an image CDN that resizes on the fly.",
    ],
    baseSavingsMs: 620,
    resourceTypes: ["Image"],
    savingsFactor: 0.45,
  },
  {
    id: "next-gen-images",
    title: "Serve images in next-gen formats",
    description: "Formats like WebP and AVIF provide better compression than PNG or JPEG.",
    whyItHappens:
      "These images are encoded as JPEG or PNG, formats that compress less efficiently than modern codecs for the same visual quality.",
    howToFix: [
      "Re-encode images as WebP or AVIF.",
      "Use the `<picture>` element to serve modern formats with a JPEG/PNG fallback.",
      "Automate format conversion in your build pipeline or image CDN.",
    ],
    baseSavingsMs: 540,
    resourceTypes: ["Image"],
    savingsFactor: 0.3,
  },
  {
    id: "unused-js",
    title: "Reduce unused JavaScript",
    description: "Unused JavaScript is increasing your network payload and parse time.",
    whyItHappens:
      "These bundles ship code paths, dependencies, or third-party features that aren't used on this specific page, adding to download, parse, and compile time.",
    howToFix: [
      "Code-split by route so each page only loads the JavaScript it needs.",
      "Remove unused dependencies and dead code paths.",
      "Lazy-load below-the-fold or interaction-only components.",
    ],
    baseSavingsMs: 890,
    resourceTypes: ["JS"],
    savingsFactor: 0.35,
  },
  {
    id: "minify-css",
    title: "Minify CSS",
    description: "Minifying CSS files can reduce network payload sizes.",
    whyItHappens:
      "These stylesheets are shipped with whitespace, comments, and unused selectors, adding unnecessary bytes to every page load.",
    howToFix: [
      "Run CSS through a minifier (cssnano, Lightning CSS, esbuild) as part of your build.",
      "Add a purge/tree-shaking step to remove unused selectors.",
    ],
    baseSavingsMs: 210,
    resourceTypes: ["CSS"],
    savingsFactor: 0.18,
  },
  {
    id: "minify-js",
    title: "Minify JavaScript",
    description: "Minifying JavaScript files can reduce payload sizes and parse time.",
    whyItHappens:
      "These scripts are shipped unminified, including full variable names, whitespace, and comments that add bytes without adding functionality.",
    howToFix: [
      "Enable minification in your bundler's production build (Terser, esbuild, SWC).",
      "Verify source maps are only served in development, not production.",
    ],
    baseSavingsMs: 260,
    resourceTypes: ["JS"],
    savingsFactor: 0.15,
  },
  {
    id: "text-compression",
    title: "Enable text compression",
    description: "Text-based resources should be served compressed.",
    whyItHappens:
      "These text-based assets are served without gzip or brotli compression, so the browser downloads the full uncompressed size over the network.",
    howToFix: [
      "Enable gzip or brotli compression at your web server or CDN.",
      "Confirm compression is active via the `Content-Encoding` response header.",
    ],
    baseSavingsMs: 470,
    resourceTypes: ["HTML", "CSS", "JS", "Other"],
    savingsFactor: 0.25,
  },
  {
    id: "server-response",
    title: "Reduce initial server response time",
    description: "The server took a while to respond with the base document.",
    whyItHappens:
      "The server takes too long to generate and return the base HTML document, which delays every other request that depends on it.",
    howToFix: [
      "Add server-side or edge caching for the base document.",
      "Optimize slow database queries or API calls in the request path.",
      "Serve the document through a CDN or edge function closer to your users.",
    ],
    baseSavingsMs: 380,
    resourceTypes: ["HTML"],
  },
  {
    id: "preload",
    title: "Preload key requests",
    description: "Some critical resources are discovered late in the page load.",
    whyItHappens:
      "These resources are referenced deep inside CSS or JavaScript rather than the initial HTML, so the browser doesn't discover them until much later in the page load.",
    howToFix: [
      "Add `<link rel=preload>` for the LCP image and any critical fonts.",
      "Avoid loading critical assets via `@import` or JS-injected tags.",
    ],
    baseSavingsMs: 300,
    resourceTypes: ["Font", "Image"],
  },
  {
    id: "cache-policy",
    title: "Use efficient cache lifetimes",
    description: "Static assets are served with short cache lifetimes.",
    whyItHappens:
      "These static assets are served with short or missing cache lifetimes, so returning visitors re-download files that haven't changed since their last visit.",
    howToFix: [
      "Set a long `max-age` and `immutable` Cache-Control header on versioned/hashed assets.",
      "Include a content hash in filenames so cache invalidation happens automatically on deploy.",
    ],
    baseSavingsMs: 340,
    resourceTypes: ["JS", "CSS", "Image", "Font"],
  },
];

function pickAffectedResources(
  resources: ResourceEntry[],
  rng: ReturnType<typeof createRng>,
  types: OpportunityResourceType[],
  savingsFactor: number | undefined,
): OpportunityResourceImpact[] {
  const matches = resources
    .filter((r) => types.includes(r.type))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 3);

  return matches.map((resource) => ({
    name: resource.name,
    type: resource.type,
    bytes: resource.bytes,
    savingsBytes: savingsFactor
      ? Math.round(resource.bytes * savingsFactor * rng.range(0.8, 1.2))
      : undefined,
  }));
}

function buildOpportunities(
  rng: ReturnType<typeof createRng>,
  t: number,
  resources: ResourceEntry[],
): Opportunity[] {
  const issueCount = clamp(Math.round(3 + t * 8), 3, OPPORTUNITY_TEMPLATES.length);
  const chosen = rng.shuffle(OPPORTUNITY_TEMPLATES).slice(0, issueCount);
  return chosen
    .map((template) => {
      const savingsMs = Math.round(template.baseSavingsMs * (0.3 + t * 1.3) * rng.range(0.75, 1.25));
      const severity: Severity = savingsMs >= 900 ? "high" : savingsMs >= 350 ? "medium" : "low";
      return {
        id: template.id,
        title: template.title,
        description: template.description,
        whyItHappens: template.whyItHappens,
        howToFix: template.howToFix,
        savingsMs,
        severity,
        affectedResources: pickAffectedResources(
          resources,
          rng,
          template.resourceTypes,
          template.savingsFactor,
        ),
      };
    })
    .sort((a, b) => b.savingsMs - a.savingsMs);
}

const DIAGNOSTIC_TEMPLATES: Array<{
  id: string;
  title: string;
  pass: string;
  fail: string;
  probability: number; // probability of passing at t=0 (best site)
}> = [
  {
    id: "https",
    title: "Document uses HTTPS",
    pass: "All resources are served securely over HTTPS.",
    fail: "Some resources are not served over a secure connection.",
    probability: 0.98,
  },
  {
    id: "payload",
    title: "Avoids enormous network payloads",
    pass: "Total page weight is within a reasonable budget.",
    fail: "Large network payloads cost users real money and are correlated with long load times.",
    probability: 0.8,
  },
  {
    id: "unused-js",
    title: "Reduce unused JavaScript",
    pass: "Little unused JavaScript was found on this page.",
    fail: "A significant amount of shipped JavaScript is never executed on this page.",
    probability: 0.55,
  },
  {
    id: "main-thread",
    title: "Avoid long main-thread tasks",
    pass: "No long tasks were found blocking the main thread.",
    fail: "Several long tasks are blocking the main thread and delaying interactivity.",
    probability: 0.6,
  },
  {
    id: "http2",
    title: "Uses HTTP/2",
    pass: "This page and its resources are served over HTTP/2.",
    fail: "Some requests are not served over HTTP/2, which enables multiplexing and header compression.",
    probability: 0.9,
  },
  {
    id: "image-dimensions",
    title: "Images have explicit width and height",
    pass: "Image elements have explicit dimensions, avoiding layout shift.",
    fail: "Some images are missing explicit width and height attributes, causing layout shift.",
    probability: 0.75,
  },
  {
    id: "unload-listeners",
    title: "Avoids `unload` event listeners",
    pass: "No `unload` event listeners were found, which allows the page to be eligible for the back/forward cache.",
    fail: "An `unload` event listener was found, which can prevent the page from being cached for back/forward navigation.",
    probability: 0.92,
  },
  {
    id: "passive-listeners",
    title: "Uses passive listeners to improve scrolling performance",
    pass: "Scroll-blocking event listeners are marked passive.",
    fail: "Some touch and wheel event listeners are not passive, which can delay scrolling.",
    probability: 0.85,
  },
];

function buildDiagnostics(rng: ReturnType<typeof createRng>, t: number): Diagnostic[] {
  return DIAGNOSTIC_TEMPLATES.map((template) => {
    const passProbability = clamp(template.probability - t * 0.55, 0.05, 0.99);
    const passes = rng.chance(passProbability);
    const status: CheckStatus = passes ? "pass" : t > 0.7 && !passes ? "fail" : "warn";
    return {
      id: template.id,
      title: template.title,
      status,
      description: passes ? template.pass : template.fail,
      details: passes ? template.pass : template.fail,
    };
  });
}

function buildSeoChecks(rng: ReturnType<typeof createRng>, t: number): AuditCheck[] {
  const altTextWarn = rng.chance(0.35 + t * 0.3);
  const sitemapWarn = rng.chance(0.1 + t * 0.25);
  const structuredDataWarn = rng.chance(0.15 + t * 0.3);
  return [
    {
      id: "title",
      title: "Page has a title",
      status: "pass",
      description: "A descriptive `<title>` tag was found in the document head.",
    },
    {
      id: "meta-description",
      title: "Meta description exists",
      status: "pass",
      description: "A meta description tag summarizes the page content for search results.",
    },
    {
      id: "canonical",
      title: "Canonical URL exists",
      status: "pass",
      description: "A `rel=canonical` link tag prevents duplicate content issues.",
    },
    {
      id: "robots",
      title: "robots.txt is accessible",
      status: "pass",
      description: "robots.txt was found and returns a valid response.",
    },
    {
      id: "sitemap",
      title: "sitemap.xml detected",
      status: sitemapWarn ? "warn" : "pass",
      description: sitemapWarn
        ? "No sitemap.xml could be found at the expected location."
        : "A sitemap.xml was found, helping search engines discover pages.",
      recommendation: sitemapWarn
        ? "Publish a sitemap.xml and reference it from robots.txt."
        : undefined,
    },
    {
      id: "mobile-friendly",
      title: "Mobile friendly",
      status: "pass",
      description: "The page uses a responsive viewport and legible font sizes.",
    },
    {
      id: "link-text",
      title: "Links have descriptive text",
      status: "pass",
      description: "Link text is descriptive and avoids generic phrases like 'click here'.",
    },
    {
      id: "alt-text",
      title: "Images have alt text",
      status: altTextWarn ? "warn" : "pass",
      description: altTextWarn
        ? "Some images are missing descriptive alt text, hurting accessibility and image SEO."
        : "Informative images all have descriptive alt attributes.",
      recommendation: altTextWarn
        ? "Add descriptive alt attributes to every meaningful image."
        : undefined,
    },
    {
      id: "structured-data",
      title: "Structured data detected",
      status: structuredDataWarn ? "warn" : "pass",
      description: structuredDataWarn
        ? "No structured data (JSON-LD) was detected on this page."
        : "Valid JSON-LD structured data helps search engines understand this page.",
      recommendation: structuredDataWarn
        ? "Add JSON-LD structured data relevant to your page type."
        : undefined,
    },
  ];
}

function buildAccessibilityChecks(rng: ReturnType<typeof createRng>, t: number): AuditCheck[] {
  const contrastWarn = rng.chance(0.3 + t * 0.35);
  const ariaWarn = rng.chance(0.1 + t * 0.3);
  return [
    {
      id: "button-names",
      title: "Buttons have accessible names",
      status: "pass",
      description: "All buttons have text or an aria-label a screen reader can announce.",
    },
    {
      id: "image-alt",
      title: "Images have alt attributes",
      status: "pass",
      description: "Every `<img>` element has an alt attribute.",
    },
    {
      id: "form-labels",
      title: "Form fields have labels",
      status: "pass",
      description: "Form inputs are associated with a `<label>` element.",
    },
    {
      id: "contrast",
      title: "Color contrast is sufficient",
      status: contrastWarn ? "warn" : "pass",
      description: contrastWarn
        ? "Some text does not have sufficient contrast against its background."
        : "Background and foreground colors meet WCAG AA contrast ratios.",
      recommendation: contrastWarn
        ? "Increase contrast to at least 4.5:1 for normal text."
        : undefined,
    },
    {
      id: "heading-order",
      title: "Heading hierarchy is valid",
      status: "pass",
      description: "Heading levels increase by one and do not skip levels.",
    },
    {
      id: "html-lang",
      title: "HTML language attribute exists",
      status: "pass",
      description: "The `<html>` element declares a valid `lang` attribute.",
    },
    {
      id: "aria-valid",
      title: "ARIA attributes are valid",
      status: ariaWarn ? "warn" : "pass",
      description: ariaWarn
        ? "Some elements use ARIA attributes with invalid values."
        : "ARIA attributes and roles are used correctly throughout the page.",
      recommendation: ariaWarn ? "Review ARIA attribute values against the spec." : undefined,
    },
  ];
}

function buildBestPracticesChecks(rng: ReturnType<typeof createRng>, t: number): AuditCheck[] {
  const consoleWarn = rng.chance(0.2 + t * 0.4);
  const securityHeadersWarn = rng.chance(0.25 + t * 0.35);
  const thirdPartyWarn = rng.chance(0.2 + t * 0.4);
  const modernImagesWarn = rng.chance(0.3 + t * 0.35);
  return [
    {
      id: "https",
      title: "Uses HTTPS",
      status: "pass",
      description: "All resources are transferred over a secure connection.",
    },
    {
      id: "console-errors",
      title: "No browser console errors",
      status: consoleWarn ? "warn" : "pass",
      description: consoleWarn
        ? "Errors were logged to the console, which usually indicate deeper issues."
        : "No errors were logged to the console during page load.",
      recommendation: consoleWarn ? "Fix reported console errors and re-test." : undefined,
    },
    {
      id: "deprecated-apis",
      title: "Avoids deprecated APIs",
      status: "pass",
      description: "No deprecated or soon-to-be-removed web platform APIs were detected.",
    },
    {
      id: "security-headers",
      title: "Uses secure response headers",
      status: securityHeadersWarn ? "warn" : "pass",
      description: securityHeadersWarn
        ? "Common security headers (CSP, X-Content-Type-Options) were not detected."
        : "Security headers such as CSP and X-Content-Type-Options are present.",
      recommendation: securityHeadersWarn
        ? "Add a Content-Security-Policy and other recommended security headers."
        : undefined,
    },
    {
      id: "third-party",
      title: "Limits third-party impact",
      status: thirdPartyWarn ? "warn" : "pass",
      description: thirdPartyWarn
        ? "Third-party scripts are blocking the main thread for a significant amount of time."
        : "Third-party code has minimal impact on load performance.",
      recommendation: thirdPartyWarn
        ? "Lazy-load non-critical third-party scripts." : undefined,
    },
    {
      id: "modern-images",
      title: "Uses modern image formats",
      status: modernImagesWarn ? "warn" : "pass",
      description: modernImagesWarn
        ? "Some images could be served in next-gen formats like WebP or AVIF."
        : "Images are served in efficient, modern formats.",
      recommendation: modernImagesWarn ? "Convert images to WebP or AVIF." : undefined,
    },
  ];
}

const RESOURCE_CATEGORY_BASE_KB: Record<ResourceCategory, number> = {
  HTML: 24,
  CSS: 182,
  JavaScript: 1400,
  Images: 820,
  Fonts: 210,
  Other: 95,
};

function buildResources(rng: ReturnType<typeof createRng>, t: number) {
  const scale = 0.55 + t * 0.9;
  const breakdown: ResourceCategoryBreakdown[] = (
    Object.keys(RESOURCE_CATEGORY_BASE_KB) as ResourceCategory[]
  ).map((category) => ({
    category,
    bytes: Math.round(RESOURCE_CATEGORY_BASE_KB[category] * 1024 * scale * rng.range(0.85, 1.15)),
  }));

  const jsTotal = breakdown.find((b) => b.category === "JavaScript")!.bytes;
  const cssTotal = breakdown.find((b) => b.category === "CSS")!.bytes;
  const imgTotal = breakdown.find((b) => b.category === "Images")!.bytes;
  const fontTotal = breakdown.find((b) => b.category === "Fonts")!.bytes;
  const htmlTotal = breakdown.find((b) => b.category === "HTML")!.bytes;
  const otherTotal = breakdown.find((b) => b.category === "Other")!.bytes;

  const resourceEntries: ResourceEntry[] = [
    { name: "main.js", type: "JS", bytes: Math.round(jsTotal * 0.3) },
    { name: "vendor.js", type: "JS", bytes: Math.round(jsTotal * 0.38) },
    { name: "analytics.js", type: "JS", bytes: Math.round(jsTotal * 0.07) },
    { name: "styles.css", type: "CSS", bytes: Math.round(cssTotal * 0.65) },
    { name: "critical.css", type: "CSS", bytes: Math.round(cssTotal * 0.2) },
    { name: "hero.webp", type: "Image", bytes: Math.round(imgTotal * 0.2) },
    { name: "gallery-1.jpg", type: "Image", bytes: Math.round(imgTotal * 0.14) },
    { name: "gallery-2.jpg", type: "Image", bytes: Math.round(imgTotal * 0.12) },
    { name: "logo.svg", type: "Image", bytes: Math.round(imgTotal * 0.02) },
    { name: "font.woff2", type: "Font", bytes: Math.round(fontTotal * 0.45) },
    { name: "font-bold.woff2", type: "Font", bytes: Math.round(fontTotal * 0.4) },
    { name: "index.html", type: "HTML", bytes: htmlTotal },
    { name: "third-party-widget.js", type: "Other", bytes: Math.round(otherTotal * 0.6) },
  ];
  const resources = resourceEntries.sort((a, b) => b.bytes - a.bytes);

  const totalPageWeightBytes = breakdown.reduce((sum, b) => sum + b.bytes, 0);
  return { resources, breakdown, totalPageWeightBytes };
}

function buildTimeline(coreWebVitals: CoreWebVitals): TimelineEvent[] {
  const dnsStart = 0;
  const dnsDur = 40;
  const connStart = dnsStart + dnsDur;
  const connDur = 60;
  const ttfbStart = connStart + connDur;
  const ttfbDur = Math.max(60, coreWebVitals.ttfb - ttfbStart);
  const fcpMs = coreWebVitals.fcp * 1000;
  const fcpStart = ttfbStart + ttfbDur;
  const fcpDur = Math.max(80, fcpMs - fcpStart);
  const lcpMs = coreWebVitals.lcp * 1000;
  const lcpStart = fcpStart + fcpDur;
  const lcpDur = Math.max(100, lcpMs - lcpStart);

  return [
    { label: "DNS Lookup", startMs: dnsStart, durationMs: dnsDur },
    { label: "Connection", startMs: connStart, durationMs: connDur },
    { label: "TTFB", startMs: ttfbStart, durationMs: ttfbDur },
    { label: "First Contentful Paint", startMs: fcpStart, durationMs: fcpDur },
    { label: "Largest Contentful Paint", startMs: lcpStart, durationMs: lcpDur },
  ];
}

function toHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function generateReport(url: string, strategy: Strategy): PerformanceReport {
  const hostname = toHostname(url);
  const normalized = `${hostname}`.toLowerCase();

  // Shared "site quality" seed keeps performance correlated across
  // mobile/desktop and across repeat visits for the same hostname,
  // while each strategy still gets its own deterministic jitter.
  const siteRng = createRng(normalized);
  const variantRng = createRng(`${normalized}::${strategy}`);
  const quality = siteRng.next();

  const desktopPerformance = round(58 + quality * 40);
  const mobilePenalty = siteRng.int(8, 18);

  const performance = clamp(
    strategy === "desktop"
      ? desktopPerformance + variantRng.int(-3, 3)
      : desktopPerformance - mobilePenalty + variantRng.int(-3, 3),
    5,
    100,
  );

  const strategyPenalty = strategy === "mobile" ? variantRng.int(0, 4) : 0;
  const accessibility = clamp(round(80 + quality * 19) + variantRng.int(-3, 2) - strategyPenalty, 40, 100);
  const bestPractices = clamp(round(75 + quality * 24) + variantRng.int(-3, 3) - strategyPenalty, 40, 100);
  const seo = clamp(round(82 + quality * 17) + variantRng.int(-2, 3) - strategyPenalty, 40, 100);

  const t = (100 - performance) / 100;

  const coreWebVitals: CoreWebVitals = {
    lcp: round(clamp(1.0 + t * 3.6 + variantRng.range(-0.15, 0.15), 0.6, 6), 1),
    inp: Math.round(clamp(60 + t * 460 + variantRng.range(-20, 20), 40, 700)),
    cls: round(clamp(0.01 + t * 0.34 + variantRng.range(-0.01, 0.02), 0, 0.6), 2),
    fcp: round(clamp(0.6 + t * 2.5 + variantRng.range(-0.1, 0.1), 0.4, 4.5), 1),
    ttfb: Math.round(clamp(200 + t * 1300 + variantRng.range(-50, 50), 120, 2200)),
    speedIndex: round(clamp(1.2 + t * 4.8 + variantRng.range(-0.2, 0.2), 0.9, 8), 1),
  };

  const metrics = {
    lcp: buildMetric("lcp", coreWebVitals.lcp),
    inp: buildMetric("inp", coreWebVitals.inp),
    cls: buildMetric("cls", coreWebVitals.cls),
    fcp: buildMetric("fcp", coreWebVitals.fcp),
    ttfb: buildMetric("ttfb", coreWebVitals.ttfb),
    speedIndex: buildMetric("speedIndex", coreWebVitals.speedIndex),
  };

  const fieldData = {
    available: !siteRng.chance(0.12),
    lcp: round(coreWebVitals.lcp * variantRng.range(1.0, 1.15), 1),
    inp: Math.round(coreWebVitals.inp * variantRng.range(1.0, 1.2)),
    cls: round(coreWebVitals.cls * variantRng.range(0.9, 1.25), 2),
  };

  const labData = {
    lcp: coreWebVitals.lcp,
    fcp: coreWebVitals.fcp,
    speedIndex: coreWebVitals.speedIndex,
    ttfb: coreWebVitals.ttfb,
    tbt: Math.round(clamp(t * 480 + variantRng.range(-30, 30), 0, 900)),
  };

  const diagnostics = buildDiagnostics(variantRng, t);
  const seoChecks = buildSeoChecks(variantRng, t);
  const accessibilityChecks = buildAccessibilityChecks(variantRng, t);
  const bestPracticesChecks = buildBestPracticesChecks(variantRng, t);
  const { resources, breakdown, totalPageWeightBytes } = buildResources(variantRng, t);
  const opportunities = buildOpportunities(variantRng, t, resources);
  const timeline = buildTimeline(coreWebVitals);

  const id = hashString(`${normalized}::${strategy}`).toString(36);

  return {
    id,
    url,
    hostname,
    strategy,
    fetchedAt: new Date().toISOString(),
    performance,
    accessibility,
    bestPractices,
    seo,
    coreWebVitals,
    metrics,
    fieldData,
    labData,
    opportunities,
    diagnostics,
    seoChecks,
    accessibilityChecks,
    bestPracticesChecks,
    resources,
    resourceBreakdown: breakdown,
    totalPageWeightBytes,
    timeline,
  };
}

export const mockAnalyzer: PerformanceAnalyzer = {
  async analyze({ url, strategy }) {
    return generateReport(url, strategy);
  },
};
