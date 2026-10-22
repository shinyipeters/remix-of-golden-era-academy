import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { CourseCard } from "@/components/site/course-card";
import { coursesQueryOptions } from "@/lib/queries";

export const Route = createFileRoute("/courses")({
  loader: ({ context }) => context.queryClient.ensureQueryData(coursesQueryOptions),
  head: () => ({
    meta: [
      { title: "Course Catalogue — Golden Era Digital Academy" },
      {
        name: "description",
        content:
          "Browse all eight Golden Era Digital Academy courses: crypto trading, forex, web design, graphic design, AI tools, financial markets, social media production and digital skills.",
      },
      { property: "og:title", content: "Course Catalogue — Golden Era Digital Academy" },
      {
        property: "og:description",
        content:
          "Eight practical digital skills courses, each with individual enrolment. Find yours and enrol today.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CoursesPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-semibold text-foreground">
        The catalogue didn't load
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {error instanceof Error ? error.message : String(error)}
      </p>
    </div>
  ),
});

function CoursesPage() {
  const { data: courses } = useSuspenseQuery(coursesQueryOptions);

  return (
    <main>
      <section className="border-b border-border bg-gradient-to-b from-primary/10 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Course Catalogue
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">
            Eight courses. One golden skill set.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Every course is enrolled individually, with practical classes delivered on
            external platforms such as Google Meet, Zoom and Google Classroom. Choose a
            course to see its full curriculum, outcomes, price and enrolment steps.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {courses.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Courses are being prepared. Please check back soon.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
