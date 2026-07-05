import { useSupabaseCollection } from "@/lib/admin-store";

export type TechStackItem = {
  id: string;
  name: string;
  category: string;
  iconKey: string;
  color: string;
};

const TABLE = "tech_stack";

export function useTechStack() {
  const {
    items,
    loading,
    insert,
    update,
    remove: deleteTechItem,
  } = useSupabaseCollection<TechStackItem>(TABLE, "id", { orderBy: "createdAt" });

  const addTechItem = (data: Omit<TechStackItem, "id">) => insert(data);

  const updateTechItem = (id: string, patch: Partial<Omit<TechStackItem, "id">>) =>
    update(id, patch);

  return { techStack: items, loading, addTechItem, updateTechItem, deleteTechItem };
}
