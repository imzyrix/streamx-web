import { NavLink } from "react-router-dom";
import { cx } from "../lib/format";
import { Icon } from "./Icon";
import type { IconName } from "../lib/icons";

const TABS: Array<{ to: string; label: string; icon: IconName; end?: boolean }> = [
  { to: "/", label: "Home", icon: "home", end: true },
  { to: "/movies", label: "Movies", icon: "movies" },
  { to: "/series", label: "Series", icon: "series" },
  { to: "/search", label: "Search", icon: "search" },
];

export function TabBar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-void/85 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Primary"
    >
      <div className="grid grid-cols-4">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cx(
                "flex flex-col items-center gap-1 py-2.5 transition-colors duration-300",
                isActive ? "text-ink" : "text-mute",
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={tab.icon} size={21} className={isActive ? "text-ink" : "text-faint"} />
                <span className="font-mono text-[9px] uppercase tracking-[0.16em]">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
