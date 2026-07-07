import { useSupabaseRecord } from "@/lib/admin-store";
import { supabase } from "@/lib/supabase";

export type SiteSettings = {
  fullName: string;
  role: string; // tagline under the name
  location: string;
  availabilityText: string;
  aboutParagraphs: string[]; // one entry per paragraph
  resumeUrl: string; // defaults to "/resume.pdf"
  email: string;
  phone: string;
  social: {
    linkedin: string;
    github: string;
    facebook: string;
  };
  seo: {
    title: string;
    description: string;
  };
};

const TABLE = "site_settings";

const FALLBACK_SETTINGS: SiteSettings = {
  fullName: "",
  role: "",
  location: "",
  availabilityText: "",
  aboutParagraphs: [],
  resumeUrl: "/resume.pdf",
  email: "",
  phone: "",
  social: { linkedin: "", github: "", facebook: "" },
  seo: { title: "", description: "" },
};

/** One-off fetch for use outside React (route loaders run on the server too,
 *  where hooks aren't available) — same pattern as getAllProjects/
 *  getProjectBySlug in projects.ts. Powers the home route's server-side
 *  head() so admin-edited SEO title/description/OG tags reach non-JS
 *  crawlers and social-preview unfurlers, not just browsers that ran the
 *  client-side patch in Portfolio.tsx. Falls back to null on any failure so
 *  the caller can fall back to the hardcoded defaults instead of crashing
 *  the route. */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", 1).maybeSingle();
  if (error) {
    console.error("[supabase] failed to load site settings:", error.message);
    return null;
  }
  return (data as SiteSettings | null) ?? null;
}

export function useSiteSettings() {
  const { value, loading, update } = useSupabaseRecord<SiteSettings>(TABLE);

  const settings = value ?? FALLBACK_SETTINGS;

  const updateSettings = (patch: Partial<SiteSettings>) => update(patch);

  return { settings, loading, updateSettings };
}
