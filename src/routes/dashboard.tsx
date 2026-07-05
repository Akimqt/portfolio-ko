import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/components/Dashboard";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Karl Akim C. Dinglasan" },
      {
        name: "description",
        content:
          "Private admin panel for managing portfolio projects, tech stack, and certificates.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Dashboard,
});
