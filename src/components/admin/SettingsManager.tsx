import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Save } from "lucide-react";
import { SiFacebook } from "react-icons/si";
import { toast } from "sonner";
import { useSiteSettings, type SiteSettings } from "@/lib/settings";
import { Field, fieldInputClass, PrimaryButton } from "@/components/admin/ui";
import { EASE_SMOOTH } from "@/lib/motion-tokens";

/* Flattened, form-friendly shape — `aboutParagraphs` is fixed to two entries
   here for a simple pair of textareas rather than a dynamic add/remove list. */
type SettingsForm = {
  fullName: string;
  role: string;
  location: string;
  availabilityText: string;
  aboutParagraph1: string;
  aboutParagraph2: string;
  resumeUrl: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  facebook: string;
  seoTitle: string;
  seoDescription: string;
};

function toForm(settings: SiteSettings): SettingsForm {
  return {
    fullName: settings.fullName,
    role: settings.role,
    location: settings.location,
    availabilityText: settings.availabilityText,
    aboutParagraph1: settings.aboutParagraphs[0] ?? "",
    aboutParagraph2: settings.aboutParagraphs[1] ?? "",
    resumeUrl: settings.resumeUrl,
    email: settings.email,
    phone: settings.phone,
    linkedin: settings.social.linkedin,
    github: settings.social.github,
    facebook: settings.social.facebook,
    seoTitle: settings.seo.title,
    seoDescription: settings.seo.description,
  };
}

function toSettings(form: SettingsForm): SiteSettings {
  return {
    fullName: form.fullName,
    role: form.role,
    location: form.location,
    availabilityText: form.availabilityText,
    aboutParagraphs: [form.aboutParagraph1, form.aboutParagraph2],
    resumeUrl: form.resumeUrl.trim() || "/resume.pdf",
    email: form.email,
    phone: form.phone,
    social: {
      linkedin: form.linkedin,
      github: form.github,
      facebook: form.facebook,
    },
    seo: {
      title: form.seoTitle,
      description: form.seoDescription,
    },
  };
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="card-surface mt-6 p-6">
      <h3 className="font-display text-lg font-semibold text-[color:var(--ice)]">{title}</h3>
      {description && <p className="mt-1 text-sm text-[color:var(--platinum)]/70">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </div>
  );
}

function IconInput({
  icon,
  value,
  onChange,
  type = "text",
}: {
  icon: ReactNode;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--slate-blue)]">
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={fieldInputClass + " pl-11"}
      />
    </div>
  );
}

export default function SettingsManager() {
  const { settings, loading, updateSettings } = useSiteSettings();
  const [form, setForm] = useState<SettingsForm>(() => toForm(settings));
  const [saving, setSaving] = useState(false);

  // `settings` starts null/fallback until the Supabase fetch resolves. Sync
  // the form once that real value arrives, but only once — otherwise a
  // realtime update while someone's mid-edit here would silently clobber
  // their unsaved draft.
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current || loading) return;
    hydrated.current = true;
    setForm(toForm(settings));
  }, [settings, loading]);

  const set = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(toSettings(form));
      toast.success("Settings saved.");
    } catch {
      // useSupabaseRecord already toasted the specific error.
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div>
        <h1 className="font-display text-2xl font-semibold text-[color:var(--ice)] sm:text-3xl">
          Profile Settings
        </h1>
        <p className="mt-1 text-sm text-[color:var(--platinum)]/70">
          Manage the personal info shown across your portfolio.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE_SMOOTH }}
      >
        <SettingsCard title="Hero & Headline">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full Name">
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                className={fieldInputClass}
              />
            </Field>
            <Field label="Role / Tagline">
              <input
                type="text"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                className={fieldInputClass}
              />
            </Field>
            <Field label="Location">
              <input
                type="text"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                className={fieldInputClass}
              />
            </Field>
            <Field label="Availability Badge Text">
              <input
                type="text"
                value={form.availabilityText}
                onChange={(e) => set("availabilityText", e.target.value)}
                className={fieldInputClass}
              />
            </Field>
          </div>
        </SettingsCard>

        <SettingsCard title="About">
          <Field label="About Paragraph 1">
            <textarea
              rows={4}
              value={form.aboutParagraph1}
              onChange={(e) => set("aboutParagraph1", e.target.value)}
              className={fieldInputClass + " resize-none"}
            />
          </Field>
          <Field label="About Paragraph 2">
            <textarea
              rows={3}
              value={form.aboutParagraph2}
              onChange={(e) => set("aboutParagraph2", e.target.value)}
              className={fieldInputClass + " resize-none"}
            />
          </Field>
          <Field
            label="Resume / CV URL"
            hint='Leave as "/resume.pdf" to keep using the bundled PDF in public/.'
          >
            <input
              type="text"
              value={form.resumeUrl}
              onChange={(e) => set("resumeUrl", e.target.value)}
              className={fieldInputClass}
              placeholder="/resume.pdf"
            />
          </Field>
        </SettingsCard>

        <SettingsCard title="Contact & Social Links">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email">
              <IconInput
                icon={<Mail size={15} />}
                type="email"
                value={form.email}
                onChange={(v) => set("email", v)}
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={fieldInputClass}
                placeholder="+63 9XX XXX XXXX"
              />
            </Field>
            <Field label="LinkedIn">
              <IconInput
                icon={<Linkedin size={15} />}
                value={form.linkedin}
                onChange={(v) => set("linkedin", v)}
              />
            </Field>
            <Field label="GitHub">
              <IconInput
                icon={<Github size={15} />}
                value={form.github}
                onChange={(v) => set("github", v)}
              />
            </Field>
            <Field label="Facebook">
              <IconInput
                icon={<SiFacebook size={14} />}
                value={form.facebook}
                onChange={(v) => set("facebook", v)}
              />
            </Field>
          </div>
        </SettingsCard>

        <SettingsCard title="SEO">
          <div>
            <Field label="Meta Title">
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => set("seoTitle", e.target.value)}
                className={fieldInputClass}
              />
            </Field>
            <p className="mt-1.5 text-xs text-[color:var(--slate-blue)]/70">
              {form.seoTitle.length} characters
            </p>
          </div>
          <div>
            <Field label="Meta Description">
              <textarea
                rows={3}
                value={form.seoDescription}
                onChange={(e) => set("seoDescription", e.target.value)}
                className={fieldInputClass + " resize-none"}
              />
            </Field>
            <p className="mt-1.5 text-xs text-[color:var(--slate-blue)]/70">
              {form.seoDescription.length} characters
            </p>
          </div>
        </SettingsCard>

        <div className="mt-6 flex justify-end">
          <PrimaryButton onClick={handleSave} disabled={saving}>
            <Save size={16} /> {saving ? "Saving…" : "Save Changes"}
          </PrimaryButton>
        </div>
      </motion.div>
    </div>
  );
}
