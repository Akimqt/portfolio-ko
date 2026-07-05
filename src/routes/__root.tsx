import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--background)] px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[color:var(--turquoise)]">
          Error 404
        </p>
        <h1 className="mt-4 text-6xl font-bold text-[color:var(--ice)]">
          Page not <span className="gradient-text">found</span>
        </h1>
        <p className="mt-4 text-sm text-[color:var(--slate-blue)]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--turquoise)] px-5 py-2.5 text-sm font-medium text-[color:var(--background)] transition hover:shadow-[0_0_30px_-5px_rgba(68,127,152,0.8)]"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--background)] px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[color:var(--turquoise)]">
          Error
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[color:var(--ice)]">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-[color:var(--slate-blue)]">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--turquoise)] px-5 py-2.5 text-sm font-medium text-[color:var(--background)] transition hover:shadow-[0_0_30px_-5px_rgba(68,127,152,0.8)]"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-[color:var(--platinum)] transition hover:border-[color:var(--turquoise)] hover:text-[color:var(--ice)]"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Karl Akim C. Dinglasan — Computer Engineering Portfolio" },
      {
        name: "description",
        content:
          "Personal portfolio of Karl Akim C. Dinglasan — Computer Engineering student building full-stack web & mobile apps, with an IoT/embedded specialty.",
      },
      { name: "author", content: "Karl Akim C. Dinglasan" },
      { property: "og:title", content: "Karl Akim C. Dinglasan — Portfolio" },
      {
        property: "og:description",
        content: "Full-Stack developer with an IoT/embedded specialty. Computer Engineering at PLSP.",
      },
      { property: "og:type", content: "website" },
      /**
       * OG IMAGE — Create a 1200×630 PNG and place it at public/og-image.png.
       * Recommended content: your name ("Karl Akim C. Dinglasan"), your tagline
       * ("Computer Engineering · Full-Stack & IoT"), and the same dark background /
       * turquoise accent palette as the site. Tools: Canva, Figma, or even a simple
       * HTML/CSS screenshot. Without this file the tag is present but links will show
       * no preview image — add the file before sharing to LinkedIn/Discord/etc.
       */
      { property: "og:image", content: "/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/og-image.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}