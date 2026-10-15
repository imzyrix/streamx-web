import { Link } from "react-router-dom";
import { useHealth } from "../lib/hooks";
import { COUNTRIES } from "../lib/config";
import { Icon } from "./Icon";

const BROWSE = [
  { to: "/movies", label: "All movies" },
  { to: "/series", label: "All series" },
  { to: "/movies?genre=Sci-Fi", label: "Sci-Fi" },
  { to: "/movies?genre=Action", label: "Action" },
  { to: "/series?genre=Drama", label: "Drama" },
  { to: "/movies?genre=Documentary", label: "Documentary" },
];

export function Footer() {
  const health = useHealth();

  return (
    <footer className="relative z-10 mt-20 border-t border-line bg-void/60 pb-24 md:pb-10">
      <div className="container-x pt-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[12px] border border-line-2 bg-panel-2 text-ink">
                <Icon name="play" size={17} />
              </span>
              <span className="font-display text-xl font-bold uppercase tracking-[0.2em] text-ink">StreamX</span>
            </div>
            <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-mute">
              A single, honest window onto a self-hosted metadata API. Aggregate scores, full cast and crew, production
              facts, episode guides and where to watch — with no account, no tracking and no API keys.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-mute">
                <Icon name="verified" size={12} /> No API keys
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-mute">
                <Icon name="graph" size={12} /> {health?.upstreams?.length ?? 10} upstream sources
              </span>
            </div>
          </div>

          <div>
            <p className="label-mono">Browse</p>
            <ul className="mt-4 space-y-2.5">
              {BROWSE.map((item) => (
                <li key={item.to + item.label}>
                  <Link
                    to={item.to}
                    className="text-[13.5px] text-ink-2 transition-colors duration-300 hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label-mono">Sources</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {(health?.upstreams ?? []).map((source) => (
                <li key={source} className="truncate font-mono text-[11px] lowercase tracking-wide text-mute">
                  {source}
                </li>
              ))}
            </ul>
            <p className="label-mono mt-8">Regions</p>
            <p className="mt-3 font-mono text-[11px] text-mute">
              {COUNTRIES.length} territories for where-to-watch
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
            StreamX {health?.version ? `· api v${health.version}` : ""} · Data from public metadata providers
          </p>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-faint">
            Posters &amp; artwork © their respective rights holders
          </p>
        </div>
      </div>
    </footer>
  );
}
