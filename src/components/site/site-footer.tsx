import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary font-display text-lg font-bold text-primary-foreground">
              GE
            </span>
            <span className="font-display text-base font-semibold text-foreground">
              Golden Era Digital Academy
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Practical digital skills education — from trading and financial markets to
            design, development and AI tools.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
            </li>
            <li>
              <Link to="/courses" className="transition-colors hover:text-foreground">
                Course Catalogue
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Enrolment
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Browse the catalogue, pick a course and follow its enrolment instructions.
            Every course is enrolled individually.
          </p>
          <Link
            to="/courses"
            className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            View Courses
          </Link>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:px-6 md:flex-row">
          <p>© {new Date().getFullYear()} Golden Era Digital Academy. All rights reserved.</p>
          <p>Education only — not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}
