import { Api } from "../lib/api";
import { useApi } from "../lib/useApi";
import { formatDate, initials } from "../lib/format";
import { Modal } from "./Modal";
import { SmartImage } from "./SmartImage";
import { Skeleton } from "./Skeleton";
import { Icon } from "./Icon";

export interface PersonTarget {
  wikidataId: string;
  name: string;
  role?: string;
}

export function PersonModal({ person, onClose }: { person: PersonTarget | null; onClose: () => void }) {
  const open = person != null;
  const { data, loading, error } = useApi(
    () => (person ? Api.person(person.wikidataId) : Promise.resolve(null)),
    [person?.wikidataId],
  );

  const name = data?.name || person?.name || "Unknown";
  const lifespan = [formatDate(data?.born, { year: "numeric" }), formatDate(data?.died, { year: "numeric" })]
    .filter(Boolean)
    .join(" – ");
  const external = Object.entries(data?.externalIds ?? {}).filter(([, value]) => Boolean(value));

  return (
    <Modal open={open} onClose={onClose} title={person?.role ? `${person.role} — ${name}` : name} size="lg">
      <div className="grid gap-5 sm:grid-cols-[168px_1fr]">
        <div>
          <div className="aspect-[3/4] w-full overflow-hidden rounded-media border border-line bg-panel-2">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : data?.image ? (
              <SmartImage src={data.image} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center font-display text-3xl text-faint">{initials(name)}</div>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="font-display text-2xl tracking-tight text-ink">{name}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute">
            {lifespan ? <span>{lifespan}</span> : null}
            {data?.source ? <span>· {data.source}</span> : null}
            {person?.role ? <span>· {person.role}</span> : null}
          </div>

          {loading ? (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-3 w-11/12 rounded-full" />
              <Skeleton className="h-3 w-9/12 rounded-full" />
            </div>
          ) : error ? (
            <p className="mt-4 text-[13px] text-mute">Could not load this person right now.</p>
          ) : null}

          {data?.description ? <p className="mt-4 text-[14px] leading-relaxed text-ink-2">{data.description}</p> : null}

          {data?.wiki?.extract ? (
            <div className="mt-5 border-t border-line pt-4">
              <p className="label-mono mb-2">Wikipedia</p>
              <p className="text-[13.5px] leading-relaxed text-ink-2">{data.wiki.extract}</p>
              {data.wiki.url ? (
                <a
                  href={data.wiki.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink underline underline-offset-4"
                >
                  Read on Wikipedia <Icon name="external" size={12} />
                </a>
              ) : null}
            </div>
          ) : null}

          {external.length > 0 || data?.officialSite ? (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
              {data?.officialSite ? (
                <a
                  href={data.officialSite}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-mute transition-colors hover:border-ink hover:text-ink"
                >
                  <Icon name="globe" size={12} /> Official site
                </a>
              ) : null}
              {external.map(([key, value]) => (
                <a
                  key={key}
                  href={linkFor(key, String(value))}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-2 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-mute transition-colors hover:border-ink hover:text-ink"
                >
                  <Icon name="external" size={12} /> {key}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}

function linkFor(key: string, value: string): string {
  switch (key) {
    case "imdb":
      return `https://www.imdb.com/name/${value}/`;
    case "tmdb":
      return `https://www.themoviedb.org/person/${value}`;
    case "twitter":
      return `https://twitter.com/${value}`;
    case "instagram":
      return `https://instagram.com/${value}`;
    default:
      return value.startsWith("http") ? value : `https://www.wikidata.org/wiki/${value}`;
  }
}
