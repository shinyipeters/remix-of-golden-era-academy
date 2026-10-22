import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Award,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  ListChecks,
  Target,
  Users,
  Video,
  Wallet,
} from "lucide-react";

import { formatPrice } from "@/components/site/course-card";
import { courseIcon } from "@/lib/course-icon";
import { courseQueryOptions } from "@/lib/queries";

export const Route = createFileRoute("/courses/$slug")({
  loader: async ({ params, context }) => {
    const course = await context.queryClient.ensureQueryData(
      courseQueryOptions(params.slug),
    );
    if (!course) throw notFound();
    return course;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Course"} — Golden Era Digital Academy` },
      {
        name: "description",
        content: loaderData?.short_description ?? "Course details",
      },
      {
        property: "og:title",
        content: `${loaderData?.title ?? "Course"} — Golden Era Digital Academy`,
      },
      {
        property: "og:description",
        content: loaderData?.short_description ?? "Course details",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CourseDetailPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        This course didn't load
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : String(error)}
      </p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        Course not found
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This course may have been unpublished or the link is incorrect.
      </p>
      <Link
        to="/courses"
        className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        Back to catalogue
      </Link>
    </div>
  ),
});

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2.5">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <div className="mt-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function CourseDetailPage() {
  const { slug } = Route.useParams();
  const { data: course } = useSuspenseQuery(courseQueryOptions(slug));
  if (!course) return null;

  const Icon = courseIcon(course.slug, course.title);

  return (
    <main>
      <section className="border-b border-border bg-gradient-to-b from-primary/10 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <Link
            to="/courses"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← All courses
          </Link>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                {course.title}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {course.short_description}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {course.duration ?? "Flexible duration"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 font-semibold text-primary">
                  <Wallet className="h-4 w-4" />
                  {formatPrice(course)}
                </span>
              </div>
              <a
                href="#enrol"
                className="mt-6 inline-flex rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Enrol Now
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <Section icon={FileText} title="About this course">
          <p className="whitespace-pre-line">{course.description}</p>
        </Section>

        <Section icon={Target} title="Objectives">
          <ul className="space-y-2">
            {course.objectives.map((objective) => (
              <li key={objective} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section icon={ListChecks} title="Curriculum">
          <ol className="space-y-2">
            {course.curriculum.map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </Section>

        <Section icon={GraduationCap} title="Outcomes">
          <p className="whitespace-pre-line">{course.outcomes}</p>
        </Section>

        <Section icon={Users} title="Who it's for & entry requirements">
          <p className="whitespace-pre-line">{course.suitable_for}</p>
          <p className="mt-3 whitespace-pre-line">{course.entry_requirements}</p>
        </Section>

        <Section icon={Video} title="How classes are delivered">
          <p className="whitespace-pre-line">{course.delivery_notes}</p>
        </Section>

        <Section icon={Award} title="Certification requirements">
          <p className="whitespace-pre-line">{course.certification_requirements}</p>
        </Section>

        <Section icon={FileText} title="Important notice">
          <p className="whitespace-pre-line">{course.disclaimer}</p>
        </Section>
      </div>

      <section id="enrol" className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-foreground">
            How to enrol in {course.title}
          </h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {course.enrolment_instructions}
          </p>
          <p className="mt-6 rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm text-foreground">
            Course fee: <span className="font-semibold text-primary">{formatPrice(course)}</span>
            {course.duration ? ` · Duration: ${course.duration}` : ""}
          </p>
        </div>
      </section>
    </main>
  );
}
