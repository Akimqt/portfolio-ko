import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Award, ExternalLink, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useCertificates, type Certificate } from "@/lib/certificates";
import {
  ConfirmDialog,
  Field,
  fieldInputClass,
  GhostButton,
  ImageField,
  Modal,
  PrimaryButton,
} from "@/components/admin/ui";
import { EASE_SMOOTH } from "@/lib/motion-tokens";

type CertForm = {
  title: string;
  platform: string;
  date: string;
  image: string;
  credentialUrl: string;
};

const EMPTY_FORM: CertForm = { title: "", platform: "", date: "", image: "", credentialUrl: "" };

function isSameMonth(iso: string, ref: Date) {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}
function isSameYear(iso: string, ref: Date) {
  return new Date(iso).getFullYear() === ref.getFullYear();
}

export default function CertificatesManager() {
  const { certificates, addCertificate, updateCertificate, deleteCertificate } = useCertificates();

  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CertForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null);
  const [preview, setPreview] = useState<Certificate | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return certificates;
    return certificates.filter(
      (c) => c.title.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q),
    );
  }, [certificates, query]);

  const now = new Date();
  const thisMonth = certificates.filter((c) => isSameMonth(c.createdAt, now)).length;
  const thisYear = certificates.filter((c) => isSameYear(c.createdAt, now)).length;

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (c: Certificate) => {
    setEditingId(c.id);
    setForm({
      title: c.title,
      platform: c.platform,
      date: c.date,
      image: c.image ?? "",
      credentialUrl: c.credentialUrl ?? "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.platform.trim()) {
      setFormError("Title and platform/issuer are required.");
      return;
    }
    const payload = {
      title: form.title,
      platform: form.platform,
      date: form.date,
      image: form.image || undefined,
      credentialUrl: form.credentialUrl || undefined,
    };
    setSubmitting(true);
    try {
      if (editingId) {
        await updateCertificate(editingId, payload);
        toast.success("Certificate updated.");
      } else {
        await addCertificate(payload);
        toast.success("Certificate added.");
      }
      setModalOpen(false);
    } catch {
      // useSupabaseCollection already toasted the specific error.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--ice)] sm:text-3xl">
            Certificates Management
          </h1>
          <p className="mt-1 text-sm text-[color:var(--platinum)]/70">
            Manage your certificates and achievements.
          </p>
        </div>
        <PrimaryButton onClick={openAddModal}>
          <Plus size={16} /> Add Certificate
        </PrimaryButton>
      </div>

      <div className="relative mt-6">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--slate-blue)]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search certificates by title or platform…"
          className={fieldInputClass + " mt-0 pl-11"}
        />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c, i) => (
          <motion.div
            key={c.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04, ease: EASE_SMOOTH }}
            className="card-surface group relative overflow-hidden"
          >
            <div className="relative aspect-[4/3] w-full bg-[color:var(--surface-2)]/60">
              {c.image ? (
                <img src={c.image} alt={c.title} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-[color:var(--slate-blue)]">
                  <Award size={28} />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPreview(c)}
                  className="rounded-full bg-[color:var(--turquoise)] px-4 py-2 text-xs font-medium text-[color:var(--background)]"
                >
                  View
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openEditModal(c)}
                  className="rounded-full border border-white/30 px-4 py-2 text-xs font-medium text-white"
                >
                  Edit
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteTarget(c)}
                  className="rounded-full bg-[color:var(--destructive)] px-4 py-2 text-xs font-medium text-[color:var(--destructive-foreground)]"
                >
                  Delete
                </motion.button>
              </div>
            </div>
            <div className="p-4">
              <p className="line-clamp-2 text-sm font-medium text-[color:var(--ice)]">{c.title}</p>
              <p className="mt-1 text-xs text-[color:var(--slate-blue)]">
                {c.platform} · {c.date}
              </p>
            </div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-[color:var(--slate-blue)]">
            No certificates match your search.
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Certificates", value: certificates.length },
          { label: "Filtered Results", value: filtered.length },
          { label: "This Month", value: thisMonth },
          { label: "This Year", value: thisYear },
        ].map((s) => (
          <div key={s.label} className="card-surface p-4 text-center">
            <p className="font-display text-2xl font-semibold text-[color:var(--ice)]">{s.value}</p>
            <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-[color:var(--slate-blue)]">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Certificate" : "Add Certificate"}
        footer={
          <>
            <GhostButton onClick={() => setModalOpen(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Update" : "Create"}
            </PrimaryButton>
          </>
        }
      >
        {formError && (
          <p className="rounded-lg border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/10 px-3 py-2 text-xs text-[color:var(--destructive)]">
            {formError}
          </p>
        )}

        <Field label="Title" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className={fieldInputClass}
            placeholder="e.g. AWS Certified Cloud Practitioner"
          />
        </Field>

        <Field label="Platform / Issuer" required>
          <input
            type="text"
            value={form.platform}
            onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
            className={fieldInputClass}
            placeholder="e.g. Coursera, KOENIG Webinar"
          />
        </Field>

        <Field label="Date" hint="Free text is fine — e.g. “Jan 2025”.">
          <input
            type="text"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className={fieldInputClass}
            placeholder="e.g. Jan 2025"
          />
        </Field>

        <Field label="Certificate Image">
          <ImageField
            value={form.image}
            onChange={(v) => setForm((f) => ({ ...f, image: v }))}
            aspect="aspect-[4/3]"
          />
        </Field>

        <Field label="Credential URL" hint="Optional link to verify the credential.">
          <input
            type="text"
            value={form.credentialUrl}
            onChange={(e) => setForm((f) => ({ ...f, credentialUrl: e.target.value }))}
            className={fieldInputClass}
            placeholder="https://example.com/verify/..."
          />
        </Field>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this certificate?"
        description={`“${deleteTarget?.title}” will be removed from your portfolio. This can't be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            try {
              await deleteCertificate(deleteTarget.id);
              toast.success("Certificate deleted.");
            } catch {
              // useSupabaseCollection already toasted the specific error.
            }
          }
          setDeleteTarget(null);
        }}
      />

      {/* Lightweight preview lightbox for the "View" action */}
      {preview && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setPreview(null)}
        >
          <div className="relative max-h-[85vh] max-w-2xl">
            <button
              type="button"
              onClick={() => setPreview(null)}
              aria-label="Close preview"
              className="absolute -top-10 right-0 text-white/70 transition hover:text-white"
            >
              <X size={22} />
            </button>
            {preview.image ? (
              <img
                src={preview.image}
                alt={preview.title}
                className="max-h-[85vh] w-full rounded-lg object-contain"
              />
            ) : (
              <div className="card-surface flex h-64 w-96 items-center justify-center">
                <Award size={32} className="text-[color:var(--slate-blue)]" />
              </div>
            )}
            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="text-sm text-white/90">{preview.title}</p>
              {preview.credentialUrl && (
                <a
                  href={preview.credentialUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1 text-xs text-[color:var(--turquoise)] hover:underline"
                >
                  Verify <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
