import { useSupabaseCollection } from "@/lib/admin-store";

export type Certificate = {
  id: string;
  title: string;
  platform: string;
  date: string;
  image?: string;
  credentialUrl?: string;
  createdAt: string;
};

const TABLE = "certificates";

export function useCertificates() {
  const {
    items,
    loading,
    insert,
    update,
    remove: deleteCertificate,
  } = useSupabaseCollection<Certificate>(TABLE, "id", { orderBy: "createdAt" });

  const addCertificate = (data: Omit<Certificate, "id" | "createdAt">) => insert(data);

  const updateCertificate = (id: string, patch: Partial<Omit<Certificate, "id">>) =>
    update(id, patch);

  return { certificates: items, loading, addCertificate, updateCertificate, deleteCertificate };
}
