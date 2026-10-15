import type { CSSProperties } from "react";
import { ICONS, type IconName } from "../lib/icons";
import { cx } from "../lib/format";

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 20, className, style }: IconProps) {
  return (
    <span
      className={cx("inline-flex shrink-0 items-center justify-center [&>svg]:block", className)}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[name] }}
    />
  );
}
