import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, MonitorSmartphone, ShieldCheck } from "lucide-react";

import { CourseCard } from "@/components/site/course-card";
import { coursesQueryOptions } from "@/lib/queries";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(coursesQueryOptions),
  head: () => ({
    meta: [
      { title: "Golden Era Digital Academy — Practical Digital Skills Education" },
      {
        name: "description",
        content:
          "Golden Era Digital Academy teaches practical digital skills: cryptocurrency and forex trading, web and graphic design, AI tools, financial markets, social media production and more.",
      },
      {
        property: "og:title",
        content: "Golden Era Digital Academy — Practical Digital Skills Education",
      },
      {
        property: "og:description",
        content:
          "Eight practical courses — from trading and financial markets to design, development and AI tools. Enrol individually in the skill you want.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        The page didn't load
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : String(error)}
      </p>
    </div>
  ),
});

const HIGHLIGHTS = [
  {
    icon: MonitorSmartphone,
    title: "Practical, live classes",
    text: "Lessons run on familiar platforms like Google Meet, Zoom and Google Classroom — learn from any phone or computer.",
  },
  {
    icon: BadgeCheck,
    title: "Eight focused courses",
    text: "Each course stands on its own with a clear curriculum, outcomes and certification requirements. Enrol in exactly what you need.",
  },
  {
    icon: ShieldCheck,
    title: "Verified enrolment",
    text: "Registrations and payments are reviewed and verified by the academy before admission is approved — no guesswork.",
  },
] as const;

function HomePage() {
  const { data: courses } = useSuspenseQuery(coursesQueryOptions);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-primary)/0.15,transparent_60%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Golden Era Digital Academy
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Build the digital skills that build your future.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            From cryptocurrency and forex trading to web design, graphic design, AI tools
            and social media production — practical courses taught step by step, open to
            beginners and professionals alike.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Browse the catalogue
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#why"
              className="inline-flex items-center rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Why Golden Era
            </a>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section id="why" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <item.icon className="h-6 w-6 text-primary" />
              <h2 className="mt-4 font-display text-lg font-semibold text-foreground">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Courses */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Course Catalogue
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Choose your course
              </h2>
            </div>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              View all courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {courses.length === 0 ? (
            <p className="mt-8 rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Courses are being prepared. Please check back soon.
            </p>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Ready to start your golden era?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Pick a course, follow its enrolment instructions, and the academy will verify
            your registration and payment every step of the way.
          </p>
          <Link
            to="/courses"
            className="mt-7 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Enrol Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
