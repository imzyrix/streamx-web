import { useState } from "react";
import { cx } from "../lib/format";
import { Icon } from "./Icon";
import type { IconName } from "../lib/icons";

export interface SmartImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  eager?: boolean;
  fallbackIcon?: IconName;
}

export function SmartImage({ src, alt, className, eager, fallbackIcon = "movies" }: SmartImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={cx("grid place-items-center bg-panel-2 text-faint", className)} aria-hidden="true">
        <Icon name={fallbackIcon} size={26} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
      className={cx(
        "transition-[opacity,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
        loaded ? "opacity-100 blur-0" : "opacity-0 blur-lg",
        className,
      )}
    />
  );
}
