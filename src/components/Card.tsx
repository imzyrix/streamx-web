import { memo } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import type { MediaType, Meta } from "../lib/types";
import { cx, formatYear } from "../lib/format";
import { Icon } from "./Icon";
import { SmartImage } from "./SmartImage";

export const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export interface CardProps {
  meta: Meta;
  type?: MediaType;
  width?: "row" | "grid";
  className?: string;
}

function CardBase({ meta, type, width = "row", className }: CardProps) {
  const mediaType: MediaType = meta.type ?? type ?? "movie";
  const id = meta.imdb_id || meta.id;
  const title = meta.name || "Untitled";
  const year = formatYear(meta.releaseInfo || meta.year || meta.released);
  const rating = meta.imdbRating ? Number(meta.imdbRating) : null;
  const genre = meta.genre?.[0] || meta.genres?.[0] || null;
  const metaLine = [year, genre].filter(Boolean).join(" · ");

  return (
    <motion.article
      variants={cardVariants}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cx("group relative", width === "row" ? "w-[148px] shrink-0 sm:w-[176px]" : "w-full", className)}
    >
      <Link to={`/title/${mediaType}/${id}`} className="block rounded-media focus-visible:outline-none">
        <div className="relative overflow-hidden rounded-media border border-line bg-panel-2 transition-colors duration-500 group-hover:border-line-2">
          <div className="aspect-[2/3] w-full overflow-hidden">
            <SmartImage
              src={meta.poster}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
            />
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
            <p className="line-clamp-2 text-[12.5px] font-semibold leading-tight text-ink">{title}</p>
            <div className="mt-1.5 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-2">
              {rating ? (
                <span className="inline-flex items-center gap-1">
                  <Icon name="star" size={11} className="text-ink" />
                  {rating.toFixed(1)}
                </span>
              ) : null}
              {year ? <span>{year}</span> : null}
            </div>
          </div>

          {rating ? (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-line-2 bg-void/70 px-2 py-[3px] font-mono text-[10.5px] font-semibold text-ink backdrop-blur-md">
              <Icon name="star" size={11} className="text-ink" />
              {rating.toFixed(1)}
            </span>
          ) : null}

          <span className="absolute right-2 top-2 rounded-full border border-line-2 bg-void/70 px-2 py-[3px] font-mono text-[9.5px] uppercase tracking-[0.14em] text-mute backdrop-blur-md">
            {mediaType === "series" ? "Series" : "Film"}
          </span>
        </div>

        <div className="mt-2.5">
          <h3 className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-ink-2 transition-colors duration-300 group-hover:text-ink">
            {title}
          </h3>
          {metaLine ? (
            <p className="mt-1 truncate font-mono text-[10.5px] uppercase tracking-[0.12em] text-mute">{metaLine}</p>
          ) : null}
        </div>
      </Link>
    </motion.article>
  );
}

export const Card = memo(CardBase);
