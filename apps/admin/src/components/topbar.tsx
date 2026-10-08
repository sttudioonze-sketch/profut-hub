export function Topbar({ title, user, actions }: { title: string; user: string; actions?: React.ReactNode }) {
  const initials = user
    .replace(/\(.*?\)/g, "")
    .split(/[\s@.]+/)
    .filter((p) => /^\p{L}/u.test(p))
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return (
    <header className="flex items-center justify-between gap-4 pb-5">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <div className="flex items-center gap-3">
        {actions}
        <span className="hidden text-sm text-muted sm:inline">{user}</span>
        <span className="flex size-9 items-center justify-center rounded-full bg-graphite text-xs font-bold text-white">{initials}</span>
      </div>
    </header>
  );
}
