import { slugify, useSupabaseCollection } from "@/lib/admin-store";
import { supabase } from "@/lib/supabase";

export type Project = {
  slug: string;
  title: string;
  category: string;
  short: string;
  long: string;
  tags: string[];
  features: string[];
  image?: string;
  gallery?: string[];
  link?: string;
  github?: string;
  placeholder?: boolean;
  meta?: string;
};

const TABLE = "projects";

/** One-off fetch for use outside React (route loaders run on the server too,
 *  where hooks aren't available). Always hits Supabase fresh — no seed
 *  fallback, since the seed now only exists as the one-time insert in
 *  supabase/schema.sql. */
export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from(TABLE).select("*").order("createdAt");
  if (error) {
    console.error("[supabase] failed to load projects:", error.message);
    return [];
  }
  return (data ?? []) as Project[];
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  const { data, error } = await supabase.from(TABLE).select("*").eq("slug", slug).maybeSingle();
  if (error) {
    console.error("[supabase] failed to load project:", error.message);
    return undefined;
  }
  return (data ?? undefined) as Project | undefined;
}

function uniqueSlug(title: string, taken: Set<string>): string {
  const base = slugify(title);
  let candidate = base;
  let n = 2;
  while (taken.has(candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

/** Read/write access to the project list from the admin panel and the public
 *  site alike — see admin-store.ts for how the underlying persistence works. */
export function useProjects() {
  const {
    items,
    loading,
    insert,
    update,
    remove: deleteProject,
  } = useSupabaseCollection<Project>(TABLE, "slug", { orderBy: "createdAt" });

  const addProject = async (data: Omit<Project, "slug"> & { slug?: string }) => {
    const taken = new Set(items.map((p) => p.slug));
    const desired = data.slug ? slugify(data.slug) : slugify(data.title);
    const finalSlug = taken.has(desired) ? uniqueSlug(data.title, taken) : desired;
    return insert({ ...data, slug: finalSlug });
  };

  const updateProject = (slug: string, patch: Partial<Project>) => update(slug, patch);

  return { projects: items, loading, addProject, updateProject, deleteProject };
}
