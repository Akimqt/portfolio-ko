import { createFileRoute } from "@tanstack/react-router";
import Portfolio from "@/components/Portfolio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Karl Akim C. Dinglasan — Computer Engineering Portfolio" },
      {
        name: "description",
        content:
          "Personal portfolio of Karl Akim C. Dinglasan — Computer Engineering student building practical full-stack & IoT solutions.",
      },
      { property: "og:title", content: "Karl Akim C. Dinglasan — Portfolio" },
      {
        property: "og:description",
        content: "Full-Stack & IoT developer. Computer Engineering at PLSP.",
      },
    ],
  }),
  component: Portfolio,
});
