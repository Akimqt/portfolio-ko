import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Cpu,
  ExternalLink,
  Github,
  Images,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useProjects, type Project } from "@/lib/projects";
import { slugify } from "@/lib/admin-store";
import {
  ConfirmDialog,
  Field,
  fieldInputClass,
  GalleryField,
  GhostButton,
  ImageField,
  Modal,
  PrimaryButton,
  TagInput,
  TiltCard,
} from "@/components/admin/ui";
import { EASE_SMOOTH, SPRING_LIFT, TAP_SCALE } from "@/lib/motion-tokens";

type ProjectForm = {
  title: string;
  category: string;
  slug: string;
  meta: string;
  short: string;
  long: string;
  image: string;
  gallery: string[];
  link: string;
  github: string;
  tags: string[];
  features: string[];
};

const PROJECT_CATEGORIES = [
  { value: "Software", icon: Code2 },
  { value: "Hardware", icon: Cpu },
] as const;

const EMPTY_FORM: ProjectForm = {
  title: "",
  category: "Software",
  slug: "",
  meta: "",
  short: "",
  long: "",
  image: "",
  gallery: [],
  link: "",
  github: "",
  tags: [],
  features: [],
};

/** Keeps the cover image as gallery[0] without duplicating it, so the lightbox
 *  on the public site always opens on the same image shown on the card. */
function withCoverFirst(image: string, gallery: string[]): string[] {
  if (!image) return gallery;
  return [image, ...gallery.filter((g) => g !== image)];
}

function toForm(p: Project): ProjectForm {
  return {
    title: p.title,
    category: p.category,
    slug: p.slug,
    meta: p.meta ?? "",
    short: p.short,
    long: p.long,
    image: p.image ?? "",
    gallery: p.gallery ?? [],
    link: p.link ?? "",
    github: p.github ?? "",
    tags: p.tags,
    features: p.features,
  };
}

export default function ProjectsManager() {
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const visible = projects.filter((p) => !p.placeholder);

  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Keep the cover image mirrored as the first gallery slot while the modal
  // is open, so the gallery preview always matches what actually saves.
  useEffect(() => {
    if (!modalOpen || !form.image) return;
    setForm((f) => {
      const synced = withCoverFirst(f.image, f.gallery);
      if (synced.length === f.gallery.length && synced.every((g, i) => g === f.gallery[i])) {
        return f;
      }
      return { ...f, gallery: synced };
    });
  }, [modalOpen, form.image]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [visible, query]);

  const openAddModal = () => {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingSlug(p.slug);
    setForm(toForm(p));
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.short.trim() || !form.long.trim() || !form.category.trim()) {
      setFormError("Title, category, short description, and full description are required.");
      return;
    }

    setSubmitting(true);
    const gallery = form.image ? withCoverFirst(form.image, form.gallery) : form.gallery;
    try {
      if (editingSlug) {
        const desiredSlug = form.slug.trim() ? slugify(form.slug) : editingSlug;
        const collision = projects.some((p) => p.slug === desiredSlug && p.slug !== editingSlug);
        if (collision) {
          setFormError("That URL slug is already used by another project. Choose a different one.");
          setSubmitting(false);
          return;
        }
        await updateProject(editingSlug, {
          title: form.title,
          category: form.category,
          slug: desiredSlug,
          meta: form.meta || undefined,
          short: form.short,
          long: form.long,
          image: form.image || undefined,
          gallery: gallery.length > 0 ? gallery : undefined,
          link: form.link || undefined,
          github: form.github || undefined,
          tags: form.tags,
          features: form.features,
        });
        toast.success("Project updated.");
      } else {
        await addProject({
          title: form.title,
          category: form.category,
          slug: form.slug || undefined,
          meta: form.meta || undefined,
          short: form.short,
          long: form.long,
          image: form.image || undefined,
          gallery: gallery.length > 0 ? gallery : undefined,
          link: form.link || undefined,
          github: form.github || undefined,
          tags: form.tags,
          features: form.features,
        });
        toast.success("Project added.");
      }
      setModalOpen(false);
    } catch {
      // useSupabaseCollection already toasts the specific error; keep the
      // modal open so the person doesn't lose what they typed.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[color:var(--ice)] sm:text-3xl">
            Projects Management
          </h1>
          <p className="mt-1 text-sm text-[color:var(--platinum)]/70">
            Add, edit, or remove the projects shown on your portfolio.
          </p>
        </div>
        <PrimaryButton onClick={openAddModal}>
          <Plus size={16} /> Add New Project
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
          placeholder="Search projects by title, category, or tag…"
          className={fieldInputClass + " mt-0 pl-11"}
        />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p, i) => (
          <motion.div
            key={p.slug}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04, ease: EASE_SMOOTH }}
          >
            <TiltCard maxTilt={5} className="h-full">
              <motion.div
                whileHover={{ y: -4 }}
                transition={SPRING_LIFT}
                className="group flex h-full flex-col card-surface overflow-hidden transition hover:border-[color:var(--turquoise)]/50 hover:shadow-[0_20px_50px_-24px_rgba(68,127,152,0.5)]"
              >
                <div className="p-2.5 pb-0">
                  <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-[color:var(--surface-2)] ring-1 ring-white/10">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-[color:var(--slate-blue)]/50">
                        <Images size={20} />
                      </div>
                    )}
                    {p.gallery && p.gallery.length > 1 && (
                      <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white [backdrop-filter:blur(4px)]">
                        <Images size={10} /> {p.gallery.length}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[color:var(--turquoise)]">
                    {p.category}
                  </span>
                  <h3 className="mt-1 font-display text-[15px] font-semibold leading-snug text-[color:var(--ice)]">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs text-[color:var(--platinum)]/70">
                    {p.short}
                  </p>
                  {p.tags.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {p.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] text-[color:var(--slate-blue)]"
                        >
                          {t}
                        </span>
                      ))}
                      {p.tags.length > 3 && (
                        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] text-[color:var(--slate-blue)]/70">
                          +{p.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-2.5 text-[color:var(--slate-blue)]">
                    {p.link && <ExternalLink size={12} />}
                    {p.github && <Github size={12} />}
                  </div>
                  <div className="mt-auto flex gap-2 pt-3">
                    <motion.button
                      type="button"
                      onClick={() => openEditModal(p)}
                      whileTap={TAP_SCALE}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[color:var(--turquoise)]/30 bg-[color:var(--turquoise)]/10 px-3 py-1.5 text-[11px] font-medium text-[color:var(--turquoise)] transition hover:bg-[color:var(--turquoise)]/20"
                    >
                      <Pencil size={12} /> Edit
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setDeleteTarget(p)}
                      whileTap={TAP_SCALE}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[color:var(--destructive)]/30 bg-[color:var(--destructive)]/10 px-3 py-1.5 text-[11px] font-medium text-[color:var(--destructive)] transition hover:bg-[color:var(--destructive)]/20"
                    >
                      <Trash2 size={12} /> Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </TiltCard>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-sm text-[color:var(--slate-blue)]">
            No projects match your search.
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSlug ? "Edit Project" : "Add New Project"}
        footer={
          <>
            <GhostButton onClick={() => setModalOpen(false)}>Cancel</GhostButton>
            <PrimaryButton onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving…" : editingSlug ? "Update" : "Create"}
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
            placeholder="e.g. IoT Water Monitor"
          />
        </Field>

        <Field label="Category" required>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {PROJECT_CATEGORIES.map(({ value, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, category: value }))}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                  form.category === value
                    ? "border-[color:var(--turquoise)] bg-[color:var(--turquoise)]/15 text-[color:var(--turquoise)]"
                    : "border-white/10 text-[color:var(--slate-blue)] hover:border-white/20 hover:text-[color:var(--ice)]"
                }`}
              >
                <Icon size={15} /> {value}
              </button>
            ))}
          </div>
        </Field>

        <Field
          label="URL Slug"
          hint={`Shown at /projects/${form.slug ? slugify(form.slug) : "your-slug"} — leave blank to auto-generate from the title.`}
        >
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className={fieldInputClass}
            placeholder="auto-generated-from-title"
          />
        </Field>

        <Field
          label="Short Description"
          required
          hint="A one–two sentence summary shown on the project card."
        >
          <textarea
            value={form.short}
            onChange={(e) => setForm((f) => ({ ...f, short: e.target.value }))}
            rows={2}
            className={fieldInputClass + " resize-none"}
          />
        </Field>

        <Field
          label="Full Description"
          required
          hint="The longer write-up shown on the project's detail page."
        >
          <textarea
            value={form.long}
            onChange={(e) => setForm((f) => ({ ...f, long: e.target.value }))}
            rows={5}
            className={fieldInputClass + " resize-none"}
          />
        </Field>

        <Field label="Meta line" hint="Optional — e.g. “A.Y. 2025 · Team Project (3 members)”.">
          <input
            type="text"
            value={form.meta}
            onChange={(e) => setForm((f) => ({ ...f, meta: e.target.value }))}
            className={fieldInputClass}
          />
        </Field>

        <Field label="Cover Image" hint="Shown on the project card and as the detail-page preview.">
          <ImageField value={form.image} onChange={(v) => setForm((f) => ({ ...f, image: v }))} />
        </Field>

        <Field label="Gallery">
          <GalleryField
            values={form.gallery}
            onChange={(next) => setForm((f) => ({ ...f, gallery: next }))}
            coverImage={form.image}
            onSetCover={(src) => setForm((f) => ({ ...f, image: src }))}
          />
        </Field>

        <Field label="Live Demo URL">
          <input
            type="text"
            value={form.link}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            className={fieldInputClass}
            placeholder="https://example.com"
          />
        </Field>

        <Field label="GitHub URL">
          <input
            type="text"
            value={form.github}
            onChange={(e) => setForm((f) => ({ ...f, github: e.target.value }))}
            className={fieldInputClass}
            placeholder="https://github.com/username/repo"
          />
        </Field>

        <Field label="Features" hint="Bullet points shown on the project's detail page.">
          <TagInput
            values={form.features}
            onChange={(next) => setForm((f) => ({ ...f, features: next }))}
            placeholder="Enter a feature"
          />
        </Field>

        <Field label="Tech Stack Tags" hint="Shown as small badges on the project card.">
          <TagInput
            values={form.tags}
            onChange={(next) => setForm((f) => ({ ...f, tags: next }))}
            placeholder="Enter a technology"
          />
        </Field>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this project?"
        description={`“${deleteTarget?.title}” will be removed from your portfolio. This can't be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            try {
              await deleteProject(deleteTarget.slug);
              toast.success("Project deleted.");
            } catch {
              // useSupabaseCollection already toasted the specific error.
            }
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
