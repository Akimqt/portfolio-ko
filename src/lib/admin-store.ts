import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

/**
 * ---------------------------------------------------------------------------
 * Admin data layer
 * ---------------------------------------------------------------------------
 * Every collection (projects, tech stack, certificates, comments) and the
 * site settings record are read/written through Supabase (Postgres), not
 * localStorage — so edits made in the admin panel are visible to every
 * visitor, from any device, immediately.
 *
 * `useSupabaseCollection` and `useSupabaseRecord` below are thin, generic
 * wrappers: each `lib/*.ts` file (projects.ts, comments.ts, etc.) calls one
 * of these once and layers its own typed add/update/delete helpers on top,
 * so `Portfolio.tsx` and the admin components never talk to Supabase
 * directly.
 * ------------------------------------------------------------------------- */

/** Re-fetches whenever the tab regains focus/visibility. Without this, a
 *  tab that's been sitting open (e.g. the public site) keeps showing
 *  whatever it fetched on mount even after an edit/delete happens
 *  elsewhere (like the admin panel in another tab) — the data really did
 *  change in Supabase, this tab just never asked again. */
function useRefetchOnFocus(refetch: () => void) {
  useEffect(() => {
    const onFocus = () => refetch();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refetch();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refetch]);
}

/** Read/write access to a full table, keyed by `idColumn` (e.g. "slug" for
 *  projects, "id" for everything else). */
export function useSupabaseCollection<T extends Record<string, unknown>>(
  table: string,
  idColumn: keyof T & string,
  options?: { orderBy?: string; ascending?: boolean },
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    let query = supabase.from(table).select("*");
    if (options?.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending ?? true });
    }
    const { data, error } = await query;
    if (error) {
      console.error(`[supabase] failed to load "${table}":`, error.message);
      toast.error(`Couldn't load ${table} — ${error.message}`);
    } else {
      setItems((data ?? []) as T[]);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useRefetchOnFocus(refetch);

  const insert = useCallback(
    async (row: Partial<T>): Promise<T> => {
      const { data, error } = await supabase
        .from(table)
        .insert(row as never)
        .select()
        .single();
      if (error) {
        toast.error(`Couldn't save — ${error.message}`);
        throw error;
      }
      setItems((prev) => [...prev, data as T]);
      return data as T;
    },
    [table],
  );

  const update = useCallback(
    async (id: string, patch: Partial<T>): Promise<T> => {
      const { data, error } = await supabase
        .from(table)
        .update(patch as never)
        .eq(idColumn as string, id)
        .select()
        .single();
      if (error) {
        toast.error(`Couldn't save changes — ${error.message}`);
        throw error;
      }
      setItems((prev) => prev.map((it) => (it[idColumn] === id ? (data as T) : it)));
      return data as T;
    },
    [table, idColumn],
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq(idColumn as string, id);
      if (error) {
        toast.error(`Couldn't delete — ${error.message}`);
        throw error;
      }
      setItems((prev) => prev.filter((it) => it[idColumn] !== id));
    },
    [table, idColumn],
  );

  return { items, loading, refetch, insert, update, remove };
}

/** Read/write access to a single-row settings-style table (id = 1). */
export function useSupabaseRecord<T extends Record<string, unknown>>(
  table: string,
  id: number = 1,
) {
  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
    if (error) {
      console.error(`[supabase] failed to load "${table}":`, error.message);
      toast.error(`Couldn't load settings — ${error.message}`);
    } else {
      setValue(data as T);
    }
    setLoading(false);
  }, [table, id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useRefetchOnFocus(refetch);

  const update = useCallback(
    async (patch: Partial<T>): Promise<T> => {
      const { data, error } = await supabase
        .from(table)
        .update(patch as never)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        toast.error(`Couldn't save settings — ${error.message}`);
        throw error;
      }
      setValue(data as T);
      return data as T;
    },
    [table, id],
  );

  return { value, loading, update };
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project"
  );
}

/* ---------------------------------------------------------------------------
 * Admin auth
 * ---------------------------------------------------------------------------
 * Real authentication via Supabase Auth. Login happens directly against
 * Supabase's servers (not a local string comparison), and the resulting
 * session's JWT is what every table's Row Level Security policy checks
 * before allowing a write — see supabase/schema.sql.
 *
 * Create your one admin user from the Supabase Dashboard: Authentication →
 * Users → Add user. There's no sign-up form in this app on purpose; make
 * sure "Allow new users to sign up" is turned OFF in your project's auth
 * settings so nobody else can create an authenticated session.
 * ------------------------------------------------------------------------- */

export function useAdminAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false as const, message: error.message };
    setSession(data.session);
    return { ok: true as const };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  return { authed: !!session, ready, email: session?.user.email ?? null, login, logout };
}

/* ---------------------------------------------------------------------------
 * Image helper — lets admin forms accept either a pasted URL or a local file
 * (converted to a data URL for now). Note: this stores the full image inline
 * as a base64 string in the row, which works but bloats table rows fast —
 * moving uploads to Supabase Storage (so this stores just a public URL
 * instead) is the natural next step, tracked separately.
 * ------------------------------------------------------------------------- */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Reject uploads above this size before we even try to read them — stored
 *  inline in Postgres (see note above), an unbounded upload turns into an
 *  unbounded row. 2MB is generous for a photo that's about to be downscaled
 *  anyway. */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

/** Same idea as MAX_UPLOAD_BYTES, but sized for a resume PDF instead of a
 *  photo — there's no downscale step for a PDF, so this caps the raw file
 *  itself. 5MB is generous for a one-or-two-page text resume while still
 *  keeping the stored data URL well within Postgres's comfort zone. */
export const MAX_RESUME_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Downscale + re-encode an image file client-side before it's stored as a
 *  data URL: draws it to a canvas capped at `maxDimension` on the long edge,
 *  then exports as JPEG at `quality`. This is a stopgap, not a replacement
 *  for real object storage (see the note above) — it just keeps someone
 *  dropping in a 10MB phone photo from bloating a row today. Falls back to
 *  the original file's data URL if canvas decoding fails for any reason
 *  (e.g. an unusual format the browser's <img> can't decode), so an upload
 *  never silently disappears. */
export function downscaleImage(
  file: File,
  maxDimension = 1600,
  quality = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("canvas 2d context unavailable");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Couldn't decode image for downscaling"));
    };
    img.src = objectUrl;
  }).catch(() => fileToDataUrl(file)) as Promise<string>;
}