import { motion } from "motion/react";
import type { MediaType, Meta } from "../lib/types";
import { useWatchlist } from "../lib/watchlist";
import { cx } from "../lib/format";
import { Icon } from "./Icon";

export interface BookmarkButtonProps {
  meta: Meta;
  type: MediaType;
  className?: string;
}

/**
 * Toggles a title in the local watchlist. The watchlist lives in localStorage
 * only, so this never talks to the API and works fully offline.
 */
export function BookmarkButton({ meta, type, className }: BookmarkButtonProps) {
  const { has, toggle } = useWatchlist();
  const id = meta.imdb_id || meta.id;
  const saved = has(id);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.965 }}
      onClick={() => toggle(meta, type)}
      aria-pressed={saved}
      title={saved ? "Remove from your list" : "Add to your list"}
      className={cx(
        "inline-flex items-center gap-2.5 rounded-full border px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md transition-colors duration-300",
        saved
          ? "border-ink bg-ink text-void hover:border-ink-2 hover:bg-ink-2"
          : "border-line-2 bg-panel-2/50 text-ink hover:border-ink",
        className,
      )}
    >
      <Icon name={saved ? "check" : "bookmark"} size={15} />
      {saved ? "In your list" : "My list"}
    </motion.button>
  );
}
