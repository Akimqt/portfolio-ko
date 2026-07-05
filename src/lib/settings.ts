import { useSupabaseRecord } from "@/lib/admin-store";

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

export function useSiteSettings() {
  const { value, loading, update } = useSupabaseRecord<SiteSettings>(TABLE);

  const settings = value ?? FALLBACK_SETTINGS;

  const updateSettings = (patch: Partial<SiteSettings>) => update(patch);

  return { settings, loading, updateSettings };
}
