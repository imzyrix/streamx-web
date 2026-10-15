export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function formatRuntime(value?: string | number | null): string | null {
  if (value == null) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return null;
    const h = Math.floor(value / 60);
    const m = Math.round(value % 60);
    return h ? `${h}h ${m}m` : `${m}m`;
  }
  const match = value.match(/(\d+)\s*min/i);
  if (!match) return value || null;
  const total = Number(match[1]);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
}

export function runtimeMinutes(value?: string | number | null): number | null {
  if (value == null) return null;
  if (typeof value === "number") return value > 0 ? value : null;
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

export function formatMoney(value?: number | null): string | null {
  if (value == null || !Number.isFinite(value) || value <= 0) return null;
  const units: Array<[number, string]> = [
    [1_000_000_000, "B"],
    [1_000_000, "M"],
    [1_000, "K"],
  ];
  for (const [size, suffix] of units) {
    if (value >= size) {
      const n = value / size;
      return `$${n >= 100 ? n.toFixed(0) : n.toFixed(1)}${suffix}`;
    }
  }
  return `$${value.toFixed(0)}`;
}

export function formatDate(value?: string | null, opts?: Intl.DateTimeFormatOptions): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const year = value.match(/\d{4}/);
    return year ? year[0] : null;
  }
  return new Intl.DateTimeFormat("en-US", opts ?? { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export function formatYear(value?: string | number | null): string | null {
  if (value == null) return null;
  const match = String(value).match(/\d{4}/);
  return match ? match[0] : null;
}

export function formatCount(value?: number | null): string | null {
  if (value == null || !Number.isFinite(value)) return null;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function humanizeType(value?: string | null): string {
  if (!value) return "";
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function providerTypeLabel(type: string): string {
  switch (type) {
    case "flatrate":
      return "Subscription";
    case "free":
      return "Free";
    case "ads":
      return "With ads";
    case "rent":
      return "Rent";
    case "buy":
      return "Buy";
    default:
      return humanizeType(type);
  }
}

export function qualityLabel(quality?: string | null): string | null {
  if (!quality) return null;
  const q = quality.replace(/^_/, "").toUpperCase();
  if (q === "4K") return "4K";
  if (q === "HD") return "HD";
  if (q === "SD") return "SD";
  return q;
}

export function stripTags(value?: string | null): string {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, "");
}

export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}
