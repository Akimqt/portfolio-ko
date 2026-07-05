import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Github, Code2, Layers, Sparkles } from "lucide-react";
import { getAllProjects, getProjectBySlug } from "@/lib/projects";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ params }) => {
    const project = await getProjectBySlug(params.slug);
    if (!project) throw notFound();
    const allProjects = await getAllProjects();
    return { project, allProjects };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.project.title} — Karl Akim C. Dinglasan` },
          { name: "description", content: loaderData.project.short },
          { property: "og:title", content: `${loaderData.project.title} — Portfolio Project` },
          { property: "og:description", content: loaderData.project.short },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[color:var(--turquoise)]">
          404
        </p>
        <h1 className="mt-4 text-3xl font-bold text-[color:var(--ice)]">Project not found</h1>
        <p className="mt-2 text-[color:var(--slate-blue)]">
          This project doesn't exist or may have been moved.
        </p>
        <Link
          to="/"
          hash="works"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--turquoise)] px-5 py-2.5 text-sm font-medium text-[color:var(--background)] transition hover:shadow-[0_0_30px_-5px_rgba(68,127,152,0.8)]"
        >
          <ArrowLeft size={14} /> Back to Portfolio
        </Link>
      </div>
    </div>
  ),
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { project, allProjects } = Route.useLoaderData();

  return (
    <div className="relative min-h-screen px-6 py-16 text-[color:var(--foreground)] sm:py-24">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to="/"
            hash="works"
            className="inline-flex items-center gap-2 text-sm text-[color:var(--slate-blue)] transition hover:text-[color:var(--ice)]"
          >
            <ArrowLeft size={15} /> Back
          </Link>
        </motion.div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          {/* Left column: title, description, stats, links, tech tags */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.21, 0.6, 0.35, 1] }}
          >
            <span className="inline-block rounded-full bg-[color:var(--turquoise)]/15 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[color:var(--turquoise)]">
              {project.category}
            </span>
            <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
              {project.title.split(" ").slice(0, -1).join(" ")}{" "}
              <span className="gradient-text">{project.title.split(" ").slice(-1)}</span>
            </h1>
            {project.meta && (
              <p className="mt-3 text-sm text-[color:var(--slate-blue)]">{project.meta}</p>
            )}

            <p className="mt-6 leading-relaxed text-[color:var(--platinum)]/85">{project.long}</p>

            {/* Stat boxes */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:max-w-md">
              <div className="card-surface flex items-center gap-3 p-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--turquoise)]/15 text-[color:var(--turquoise)]">
                  <Code2 size={16} />
                </div>
                <div>
                  <p className="text-xl font-bold leading-none text-[color:var(--ice)]">
                    {project.tags.length}
                  </p>
                  <p className="text-[11px] text-[color:var(--slate-blue)]">Technologies Used</p>
                </div>
              </div>
              <div className="card-surface flex items-center gap-3 p-4">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[color:var(--turquoise)]/15 text-[color:var(--turquoise)]">
                  <Layers size={16} />
                </div>
                <div>
                  <p className="text-xl font-bold leading-none text-[color:var(--ice)]">
                    {project.features.length}
                  </p>
                  <p className="text-[11px] text-[color:var(--slate-blue)]">Key Features</p>
                </div>
              </div>
            </div>

            {/* Link buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--turquoise)] px-5 py-2.5 text-sm font-medium text-[color:var(--background)] transition hover:shadow-[0_0_30px_-5px_rgba(68,127,152,0.8)]"
                >
                  Visit Live Site <ExternalLink size={14} />
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--slate-blue)]/30 px-5 py-2.5 text-sm text-[color:var(--slate-blue)]/70">
                  No Live Link <ExternalLink size={14} />
                </span>
              )}
              {project.github ? (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--slate-blue)]/40 px-5 py-2.5 text-sm text-[color:var(--platinum)] transition hover:border-[color:var(--turquoise)] hover:text-[color:var(--ice)]"
                >
                  View Source <Github size={14} />
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--slate-blue)]/30 px-5 py-2.5 text-sm text-[color:var(--slate-blue)]/70">
                  No Repo Link <Github size={14} />
                </span>
              )}
            </div>

            {/* Technologies used */}
            {project.tags.length > 0 && (
              <div className="mt-10">
                <p className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[color:var(--slate-blue)]">
                  <Code2 size={13} /> Technologies Used
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-[color:var(--turquoise)]/30 bg-[color:var(--turquoise)]/10 px-2.5 py-1 text-xs text-[color:var(--ice)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right column: image preview + key features box */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.21, 0.6, 0.35, 1] }}
            className="space-y-6"
          >
            {project.image ? (
              <div className="card-surface overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>
            ) : (
              <div className="card-surface grid aspect-[16/10] place-items-center bg-[color:var(--surface-2)]/40">
                <Sparkles size={32} className="text-[color:var(--slate-blue)]/50" />
              </div>
            )}

            {project.features.length > 0 && (
              <div className="card-surface p-6">
                <p className="flex items-center gap-2 text-sm font-semibold text-[color:var(--ice)]">
                  <Layers size={15} className="text-[color:var(--turquoise)]" /> Key Features
                </p>
                <ul className="mt-4 space-y-3">
                  {project.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-[color:var(--platinum)]/80"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[color:var(--turquoise)]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>

        {/* Other projects */}
        <div className="mt-24 border-t border-white/10 pt-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[color:var(--turquoise)]">
            Keep Exploring
          </p>
          <h2 className="mt-3 text-2xl font-bold text-[color:var(--ice)]">More Projects</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {allProjects
              .filter((p) => p.slug !== project.slug && !p.placeholder)
              .slice(0, 3)
              .map((p) => (
                <Link
                  key={p.slug}
                  to="/projects/$slug"
                  params={{ slug: p.slug }}
                  className="group card-surface overflow-hidden transition hover:border-[color:var(--turquoise)]/50"
                >
                  {p.image && (
                    <div className="p-4 pb-0">
                      <div className="aspect-[16/10] overflow-hidden rounded-xl bg-[color:var(--surface-2)] ring-1 ring-white/10">
                        <img
                          src={p.image}
                          alt={p.title}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-sm font-semibold text-[color:var(--ice)]">{p.title}</h3>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--turquoise)]">
                      Details{" "}
                      <ArrowRight size={12} className="transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
