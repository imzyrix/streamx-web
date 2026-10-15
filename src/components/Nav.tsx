import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useMotionValueEvent, useScroll } from "motion/react";
import { useHealth } from "../lib/hooks";
import { cx } from "../lib/format";
import { Icon } from "./Icon";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/movies", label: "Movies", end: false },
  { to: "/series", label: "Series", end: false },
];

export function Nav() {
  const navigate = useNavigate();
  const health = useHealth();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");

  useMotionValueEvent(scrollY, "change", (value) => {
    setScrolled(value > 24);
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search/${encodeURIComponent(trimmed)}`);
    setQuery("");
  };

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled ? "border-b border-line bg-void/80 backdrop-blur-xl" : "border-b border-transparent bg-gradient-to-b from-void/80 to-transparent",
      )}
    >
      <div className="container-x flex h-16 items-center gap-3">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="StreamX home">
          <span className="grid h-9 w-9 place-items-center rounded-[11px] border border-line-2 bg-panel-2 text-ink transition-colors duration-300 group-hover:border-ink">
            <Icon name="play" size={16} />
          </span>
          <span className="leading-none">
            <span className="block font-display text-[16px] font-bold uppercase tracking-[0.22em] text-ink">StreamX</span>
            <span className="mt-[3px] block font-mono text-[8.5px] uppercase tracking-[0.3em] text-mute">Keyless metadata</span>
          </span>
        </Link>

        <nav className="ml-5 hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cx(
                  "rounded-full px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em] transition-colors duration-300",
                  isActive ? "bg-ink text-void" : "text-mute hover:text-ink",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submit} className="ml-auto hidden md:block" role="search">
          <label className="flex h-9 w-44 items-center gap-2 rounded-full border border-line-2 bg-panel-2/60 px-3 transition-colors duration-300 focus-within:border-ink lg:w-60">
            <Icon name="search" size={15} className="text-mute" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search films, series…"
              aria-label="Search"
              className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-faint"
            />
          </label>
        </form>

        <Link
          to="/search"
          aria-label="Search"
          className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-2 text-ink transition-colors duration-300 hover:border-ink md:hidden"
        >
          <Icon name="search" size={16} />
        </Link>

        <div className="hidden shrink-0 items-center gap-2 rounded-full border border-line px-3 py-1.5 lg:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink opacity-50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ink" />
          </span>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-mute">
            {health?.version ? `api v${health.version}` : "api"}
          </span>
        </div>
      </div>
    </header>
  );
}
