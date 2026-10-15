import { useEffect, useState } from "react";
import type { TrailerStream } from "../lib/types";
import { Modal } from "./Modal";
import { cx } from "../lib/format";
import { Icon } from "./Icon";

export function TrailerModal({
  open,
  onClose,
  title,
  trailers,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  trailers: TrailerStream[];
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (open) setActive(0);
  }, [open]);

  const current = trailers[active];

  return (
    <Modal open={open} onClose={onClose} title={`Trailer — ${title}`} size="xl" bare>
      <div className="aspect-video w-full bg-void">
        {current ? (
          <iframe
            key={current.ytId}
            title={`${title} trailer`}
            src={`https://www.youtube-nocookie.com/embed/${current.ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : null}
      </div>

      {trailers.length > 1 ? (
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-line px-4 py-3">
          {trailers.slice(0, 12).map((trailer, index) => (
            <button
              key={`${trailer.ytId}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={cx(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] transition-colors duration-300",
                index === active ? "border-ink bg-ink text-void" : "border-line-2 text-mute hover:border-ink hover:text-ink",
              )}
            >
              <Icon name="play" size={12} />
              {index === 0 ? "Main trailer" : `Clip ${index + 1}`}
            </button>
          ))}
        </div>
      ) : null}
    </Modal>
  );
}
