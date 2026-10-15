import { Link } from "react-router-dom";
import { useTitle } from "../lib/hooks";
import { Page } from "../components/Page";
import { Icon } from "../components/Icon";

export function NotFound() {
  useTitle("Page not found");

  return (
    <Page>
      <section className="container-x flex min-h-[82svh] flex-col justify-center pt-28">
        <p className="label-mono">Error 404</p>
        <h1 className="mt-4 font-display text-[clamp(2.8rem,11vw,7.5rem)] font-bold uppercase leading-[0.88] tracking-[-0.04em] text-ink">
          Lost signal
        </h1>
        <p className="mt-6 max-w-lg text-[14px] leading-relaxed text-mute">
          This route is not in the catalogue. Head back to the front page, or search the library for something else to
          watch.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-void"
          >
            <Icon name="home" size={15} /> Back home
          </Link>
          <Link
            to="/search"
            className="inline-flex items-center gap-2.5 rounded-full border border-line-2 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:border-ink"
          >
            <Icon name="search" size={15} /> Search
          </Link>
        </div>
      </section>
    </Page>
  );
}
