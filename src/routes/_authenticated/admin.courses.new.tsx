import { createFileRoute } from "@tanstack/react-router";

import { CourseForm } from "@/components/admin/course-form";

export const Route = createFileRoute("/_authenticated/admin/courses/new")({
  component: () => (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Add course</h1>
      <CourseForm />
    </div>
  ),
});
