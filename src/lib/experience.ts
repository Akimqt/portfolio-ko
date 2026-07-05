import { useSupabaseCollection } from "@/lib/admin-store";
import type { ExperienceIconKey } from "@/lib/experience-icons";

export type ExperienceItem = {
  id: string;
  iconKey: ExperienceIconKey;
  tag: string;
  title: string;
  sub: string;
  body: string;
  order: number;
  placeholder: boolean;
  createdAt: string;
};

const TABLE = "experience";

export function useExperience() {
  const {
    items,
    loading,
    insert,
    update,
    remove: deleteExperience,
  } = useSupabaseCollection<ExperienceItem>(TABLE, "id", { orderBy: "order" });

  const addExperience = (data: Omit<ExperienceItem, "id" | "createdAt">) => insert(data);

  const updateExperience = (id: string, patch: Partial<Omit<ExperienceItem, "id">>) =>
    update(id, patch);

  return { experience: items, loading, addExperience, updateExperience, deleteExperience };
}
