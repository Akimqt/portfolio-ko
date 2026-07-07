-- ---------------------------------------------------------------------------
-- PORTFOLIO_KO — Supabase schema
-- ---------------------------------------------------------------------------
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New
-- query → paste → Run) against a fresh project. Safe to re-run: everything
-- is IF NOT EXISTS / ON CONFLICT guarded except the `drop table` lines, which
-- are commented out on purpose — uncomment only if you want to wipe and
-- start over.
--
-- Column names are camelCase and double-quoted to match the TypeScript
-- types exactly (Project, TechStackItem, Certificate, Comment, SiteSettings)
-- so the app layer needs zero snake_case <-> camelCase mapping.
-- ---------------------------------------------------------------------------

-- drop table if exists projects, tech_stack, certificates, comments, site_settings cascade;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists projects (
  "slug" text primary key,
  "title" text not null,
  "category" text not null,
  "short" text not null,
  "long" text not null,
  "tags" text[] not null default '{}',
  "features" text[] not null default '{}',
  "image" text,
  "gallery" text[],
  "link" text,
  "github" text,
  "placeholder" boolean not null default false,
  "meta" text,
  "createdAt" timestamptz not null default now()
);

alter table projects enable row level security;

drop policy if exists "projects_public_read" on projects;
create policy "projects_public_read" on projects for select using (true);

drop policy if exists "projects_admin_write" on projects;
create policy "projects_admin_write" on projects for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- tech_stack
-- ---------------------------------------------------------------------------
create table if not exists tech_stack (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "category" text not null,
  "iconKey" text not null,
  "color" text not null,
  "createdAt" timestamptz not null default now(),
  constraint tech_stack_name_unique unique ("name")
);

alter table tech_stack enable row level security;

drop policy if exists "tech_stack_public_read" on tech_stack;
create policy "tech_stack_public_read" on tech_stack for select using (true);

drop policy if exists "tech_stack_admin_write" on tech_stack;
create policy "tech_stack_admin_write" on tech_stack for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- certificates
-- ---------------------------------------------------------------------------
create table if not exists certificates (
  "id" uuid primary key default gen_random_uuid(),
  "title" text not null,
  "platform" text not null,
  "date" text not null,
  "image" text,
  "credentialUrl" text,
  "createdAt" timestamptz not null default now(),
  constraint certificates_title_unique unique ("title")
);

alter table certificates enable row level security;

drop policy if exists "certificates_public_read" on certificates;
create policy "certificates_public_read" on certificates for select using (true);

drop policy if exists "certificates_admin_write" on certificates;
create policy "certificates_admin_write" on certificates for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- experience — the Experience & Education timeline
-- ---------------------------------------------------------------------------
create table if not exists experience (
  "id" uuid primary key default gen_random_uuid(),
  "iconKey" text not null default 'briefcase',
  "tag" text not null,
  "title" text not null,
  "sub" text not null,
  "body" text not null,
  "order" integer not null default 0,
  "placeholder" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  constraint experience_title_unique unique ("title")
);

alter table experience enable row level security;

drop policy if exists "experience_public_read" on experience;
create policy "experience_public_read" on experience for select using (true);

drop policy if exists "experience_admin_write" on experience;
create policy "experience_admin_write" on experience for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- comments — the one table where INSERT stays open to the public (anyone can
-- leave a comment); only pinning/deleting/approving requires an
-- authenticated admin.
--
-- Moderation model: comments land with "approved" = false and are NOT
-- publicly visible until an admin approves them from CommentsManager. This
-- was a deliberate choice over "publish instantly" — a public, unauthenticated
-- insert endpoint with no moderation queue is an open invitation for spam/
-- abuse to appear on the live site the instant it's posted, with no window
-- to catch it. The tradeoff: comments no longer show up immediately for
-- their author, and there's now an extra admin step (Approve) before a
-- comment goes live. If you'd rather keep the "instant guestbook" feel,
-- default "approved" to true and drop the filter in "comments_public_read"
-- instead — but pair that with tighter automated checks than what's here.
-- ---------------------------------------------------------------------------
create table if not exists comments (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "email" text,
  "message" text not null,
  "pinned" boolean not null default false,
  "approved" boolean not null default false,
  "createdAt" timestamptz not null default now(),
  constraint comments_name_length check (
    char_length(trim("name")) > 0 and char_length("name") <= 80
  ),
  constraint comments_message_length check (
    char_length(trim("message")) > 0 and char_length("message") <= 1000
  )
);

-- Backfill for existing rows created before the "approved" column existed —
-- keep already-live comments visible instead of hiding them all on migrate.
alter table comments add column if not exists "approved" boolean not null default false;
update comments set "approved" = true where "approved" is false;

alter table comments enable row level security;

-- Public visitors only ever see approved comments; the admin panel (an
-- authenticated session) needs to see everything, including the pending
-- queue, so it can moderate it — hence the "or authenticated" branch.
drop policy if exists "comments_public_read" on comments;
create policy "comments_public_read" on comments for select
  using ("approved" = true or auth.role() = 'authenticated');

drop policy if exists "comments_public_insert" on comments;
create policy "comments_public_insert" on comments for insert
  with check (
    char_length(trim("name")) > 0 and char_length("name") <= 80
    and char_length(trim("message")) > 0 and char_length("message") <= 1000
    and "approved" = false
    and "pinned" = false
  );

drop policy if exists "comments_admin_update" on comments;
create policy "comments_admin_update" on comments for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "comments_admin_delete" on comments;
create policy "comments_admin_delete" on comments for delete
  using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- site_settings — single row (id = 1)
-- ---------------------------------------------------------------------------
create table if not exists site_settings (
  "id" int primary key default 1,
  "fullName" text not null,
  "role" text not null,
  "location" text not null,
  "availabilityText" text not null,
  "aboutParagraphs" text[] not null default '{}',
  "resumeUrl" text not null default '/resume.pdf',
  "email" text not null,
  "phone" text,
  "social" jsonb not null default '{}',
  "seo" jsonb not null default '{}',
  constraint site_settings_singleton check ("id" = 1)
);

alter table site_settings enable row level security;

drop policy if exists "site_settings_public_read" on site_settings;
create policy "site_settings_public_read" on site_settings for select using (true);

drop policy if exists "site_settings_admin_write" on site_settings;
create policy "site_settings_admin_write" on site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Seed data — mirrors the current localStorage seed constants exactly, so
-- your live content carries over instead of resetting to empty tables.
-- Image fields are left blank here since local asset imports (proj-iot-1.png
-- etc.) don't resolve to public URLs — re-attach images via the admin panel
-- after this runs, or upload them somewhere public and paste the URLs below
-- before running this script.
-- ---------------------------------------------------------------------------

insert into projects ("slug", "title", "category", "short", "long", "tags", "features", "link", "github", "meta", "placeholder")
values
  (
    'iot-water-monitor',
    'IoT Water Monitor',
    'IoT System',
    'Full-stack dashboard and mobile app for a smart water monitoring system, talking to real ESP32 sensors.',
    'A full-stack system for monitoring water distribution: a React + TypeScript dashboard for live telemetry, a Flutter companion app with Telegram bot alerts, and a Node.js/Express backend over MQTT — all Dockerized alongside InfluxDB and MariaDB. I built the Flutter app''s UI and contributed to backend pipeline debugging. The data comes from real ESP32 sensors (flow, pressure, leak), which kept the software grounded in what the hardware could actually report. The system is designed around targets of ≥85% leak detection accuracy and ≤15-second shutoff response.',
    array['React', 'TypeScript', 'Flutter', 'Node.js', 'MQTT', 'Docker'],
    array['Real-time telemetry dashboard built in React + TypeScript', 'Flutter companion app with Telegram bot alerts', 'Node.js/Express backend over Dockerized MQTT + InfluxDB + MariaDB', 'Built on live data from ESP32 sensors (flow, pressure, leak)'],
    'https://water-monitor-gx9hos65n-kuyakim-s-projects.vercel.app/',
    'https://github.com/Akimqt/water-monitor',
    'A.Y. 2025–2026 · Team Capstone (in progress)',
    false
  ),
  (
    'plsp-lost-and-found',
    'PLSP Lost and Found Management System',
    'Web System',
    'Full-stack web app digitizing the university''s lost-and-found workflow.',
    'Built a full-stack web application that replaces the university''s manual lost-and-found logbook with a digital report → search → claim flow. I worked across the stack, focusing on the Go (Gin) API layer and the PostgreSQL schema for tracking item status end to end.',
    array['Next.js', 'Go', 'PostgreSQL', 'Docker'],
    array['Digital report → search → claim workflow', 'Go (Gin) REST API with PostgreSQL schema', 'Item status tracking from report to resolution', 'Dockerized deployment across services'],
    'https://plsp-trackback.vercel.app/',
    'https://github.com/Akimqt/plsp-trackback',
    'A.Y. 2025 · Team Project (3 members)',
    false
  ),
  (
    'regulated-dc-power-supply',
    '12V Regulated DC Power Supply',
    'Hardware',
    'Designed, fabricated, and tested a regulated 220V AC → 12V DC supply.',
    'Designed, fabricated, and tested a regulated power supply that converts 220V AC into a stable 12V DC output. Simulated in Proteus, PCB designed in EasyEDA, fabricated via manual etching, then soldered and assembled. Verified a stable 12V DC output under load using a multimeter and an LED string load test.',
    array['Proteus', 'EasyEDA', 'Circuit Design', 'PCB Fabrication'],
    array['Circuit simulation and validation in Proteus', 'Custom PCB layout designed in EasyEDA', 'Manually etched, soldered, and assembled board', 'Load-tested with multimeter + LED string under load'],
    null,
    null,
    'May 2026 · AC222 · Team Course Project (6 members)',
    false
  ),
  (
    'more-projects-coming-soon',
    'More Projects in the Works',
    'Upcoming',
    'Currently building out the next addition to this lineup — check back soon.',
    'Currently building out the next addition to this lineup — check back soon.',
    array[]::text[],
    array[]::text[],
    null,
    null,
    null,
    true
  )
on conflict ("slug") do nothing;

insert into tech_stack ("name", "category", "iconKey", "color")
values
  ('HTML5', 'Frontend', 'html5', '#E34F26'),
  ('CSS3', 'Frontend', 'css3', '#1572B6'),
  ('JavaScript', 'Frontend', 'javascript', '#F7DF1E'),
  ('React', 'Frontend', 'react', '#61DAFB'),
  ('Next.js', 'Frontend', 'nextjs', '#FFFFFF'),
  ('TypeScript', 'Frontend', 'typescript', '#3178C6'),
  ('Tailwind CSS', 'Frontend', 'tailwind', '#06B6D4'),
  ('Node.js', 'Backend', 'nodejs', '#5FA04E'),
  ('Go', 'Backend', 'go', '#00ADD8'),
  ('Express', 'Backend', 'express', '#FFFFFF'),
  ('Flutter', 'Mobile', 'flutter', '#02569B'),
  ('Dart', 'Mobile', 'dart', '#0175C2'),
  ('PostgreSQL', 'Databases', 'postgresql', '#4169E1'),
  ('MySQL', 'Databases', 'mysql', '#4479A1'),
  ('MariaDB', 'Databases', 'mariadb', '#ABC74A'),
  ('InfluxDB', 'Databases', 'influxdb', '#22ADF6'),
  ('ESP32', 'Hardware', 'esp32', '#E7352C'),
  ('C/C++ (Embedded)', 'Hardware', 'cpp', '#00599C'),
  ('Circuit Design', 'Hardware', 'circuit', '#447F98'),
  ('PCB Design', 'Hardware', 'pcb', '#447F98'),
  ('Docker', 'Tools', 'docker', '#2496ED'),
  ('MQTT', 'Tools', 'mqtt', '#660066'),
  ('Git', 'Tools', 'git', '#F03C2E'),
  ('Proteus', 'Tools', 'proteus', '#1C79B3'),
on conflict ("name") do nothing;

insert into certificates ("title", "platform", "date", "createdAt")
values
  ('Master Agile Project Success — PRINCE2® Agile® Foundation & Practitioner Training', 'KOENIG Webinar (via Zoom)', 'Jan 2025', '2025-01-15T00:00:00.000Z'),
  ('VMware NSX — Network Virtualization & Security in Hybrid Clouds', 'KOENIG Webinar (via Zoom)', 'Jan 2025', '2025-01-15T00:00:00.000Z'),
  ('Python''s Role in AI-Driven Automation', 'KOENIG Webinar (via Zoom)', 'Jan 2025', '2025-01-15T00:00:00.000Z')
on conflict ("title") do nothing;

insert into experience ("iconKey", "tag", "title", "sub", "body", "order", "placeholder")
values
  (
    'graduation-cap',
    '2024 – 2028',
    'BS Computer Engineering',
    'Pamantasan ng Lungsod ng San Pablo — San Pablo City, Laguna',
    'Relevant Coursework: Programming Logic and Design, Data Structures and Algorithms, Fundamentals of Electronics Circuits, Database Systems, Computer Networks.',
    1,
    false
  ),
  (
    'briefcase',
    '2027 onward',
    'Open to OJT / Internship Opportunities',
    'Full-Stack Development · Web & Mobile · IoT/Embedded',
    'Actively seeking on-the-job training and internship opportunities in full-stack development, with IoT and embedded systems as an added strength.',
    2,
    true
  )
on conflict ("title") do nothing;

insert into site_settings ("id", "fullName", "role", "location", "availabilityText", "aboutParagraphs", "resumeUrl", "email", "phone", "social", "seo")
values (
  1,
  'Karl Akim C. Dinglasan',
  'Computer Engineering Student · Full-Stack Developer (IoT & Embedded Specialty)',
  'Talisay, Tiaong, Quezon, Philippines',
  'Available for OJT / Internship — 2027',
  array[
    'I''m a Computer Engineering student at Pamantasan ng Lungsod ng San Pablo (2024–2028), focused on full-stack software development — React, Next.js, TypeScript, Node.js, and Flutter across web and mobile. I also understand the hardware my code talks to, which makes me especially effective on IoT and embedded projects where the software has to work hand-in-hand with real sensors and circuits.'
  ],
  '/resume.pdf',
  'karlakimdinglasan@gmail.com',
  '+63 960 349 6184',
  '{"linkedin": "https://linkedin.com/in/dinglasan-karl-akim-c-77b00b419", "github": "https://github.com/Akimqt", "facebook": "https://www.facebook.com/karlakim.dinglasan"}'::jsonb,
  '{"title": "Karl Akim C. Dinglasan — Computer Engineering Portfolio", "description": "Personal portfolio of Karl Akim C. Dinglasan — Computer Engineering student building full-stack web & mobile apps, with an IoT/embedded specialty."}'::jsonb
)
on conflict ("id") do nothing;

-- ---------------------------------------------------------------------------
-- Admin login: Supabase Auth, not this table.
-- ---------------------------------------------------------------------------
-- Create your one admin user in the Dashboard: Authentication → Users →
-- Add user → set an email + password. That becomes your admin login.
-- Do NOT enable public sign-ups for this project — there's no sign-up form
-- in the app, and leaving self-serve sign-up on would let anyone create an
-- "authenticated" session and pass every RLS check above. Turn it off at
-- Authentication → Settings → Allow new users to sign up.
