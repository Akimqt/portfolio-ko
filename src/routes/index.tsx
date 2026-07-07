import { createFileRoute } from "@tanstack/react-router";
import Portfolio from "@/components/Portfolio";
import { getSiteSettings } from "@/lib/settings";

const FALLBACK_TITLE = "Karl Akim C. Dinglasan — Computer Engineering Portfolio";
const FALLBACK_DESCRIPTION =
  "Personal portfolio of Karl Akim C. Dinglasan — Computer Engineering student building practical full-stack & IoT solutions.";
const FALLBACK_OG_TITLE = "Karl Akim C. Dinglasan — Portfolio";
const FALLBACK_OG_DESCRIPTION = "Full-Stack & IoT developer. Computer Engineering at PLSP.";

export const Route = createFileRoute("/")({
  loader: async () => {
    const settings = await getSiteSettings();
    return { settings };
  },
  head: ({ loaderData }) => {
    const seo = loaderData?.settings?.seo;
    const title = seo?.title || FALLBACK_TITLE;
    const description = seo?.description || FALLBACK_DESCRIPTION;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: seo?.title || FALLBACK_OG_TITLE },
        { property: "og:description", content: seo?.description || FALLBACK_OG_DESCRIPTION },
      ],
    };
  },
  component: Portfolio,
});
