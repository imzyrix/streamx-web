import { Api } from "../lib/api";
import { useApi } from "../lib/useApi";
import { HOME_ROW_LIMIT, type RowDef } from "../lib/config";
import { Row } from "./Row";

export function DataRow({ def, limit = HOME_ROW_LIMIT }: { def: RowDef; limit?: number }) {
  const { data, loading, error } = useApi(
    () =>
      def.source === "trending"
        ? Api.trending(def.type, limit)
        : Api.catalog(def.type, { genre: def.genre, catalog: def.catalog ?? "top" }),
    [def.key, def.type, def.genre, def.catalog, def.source, limit],
  );

  const metas = (data?.metas ?? []).slice(0, limit);

  if (!loading && !error && metas.length === 0) return null;

  const seeAllHref = def.genre
    ? `/${def.type === "movie" ? "movies" : "series"}?genre=${encodeURIComponent(def.genre)}`
    : `/${def.type === "movie" ? "movies" : "series"}`;

  return (
    <Row
      title={def.title}
      blurb={def.blurb}
      metas={metas}
      loading={loading && metas.length === 0}
      error={error}
      type={def.type}
      seeAllHref={seeAllHref}
    />
  );
}
