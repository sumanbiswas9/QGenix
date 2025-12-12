"use client";

export default function AdminLanding() {
  const cards = [
    {
      title: "Courses",
      desc: "Create and manage programs.",
      href: "/admin/courses",
    },
    {
      title: "Semesters",
      desc: "Attach semesters to courses.",
      href: "/admin/semesters",
    },
    {
      title: "Subjects",
      desc: "Manage subjects per semester.",
      href: "/admin/subjects",
    },
    {
      title: "Syllabus",
      desc: "Add modules/units/topics.",
      href: "/admin/syllabus",
    },
    {
      title: "Mock Exams",
      desc: "Patterns and publish AI papers.",
      href: "/admin/mock-exams",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <a
          key={card.href}
          href={card.href}
          className="surface flex flex-col gap-2 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <p className="text-sm font-semibold text-foreground">{card.title}</p>
          <p className="text-sm text-muted">{card.desc}</p>
          <span className="text-xs font-semibold text-primary">Open →</span>
        </a>
      ))}
    </div>
  );
}

