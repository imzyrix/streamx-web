import { useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { SmoothScroll } from "./components/SmoothScroll";
import { WebGLBackground } from "./components/WebGLBackground";
import { ScrollProgress } from "./components/ScrollProgress";
import { Grain } from "./components/Grain";
import { Nav } from "./components/Nav";
import { TabBar } from "./components/TabBar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Browse } from "./pages/Browse";
import { Search } from "./pages/Search";
import { Detail } from "./pages/Detail";
import { NotFound } from "./pages/NotFound";
import { scrollToTop } from "./lib/lenis";

function Shell() {
  const location = useLocation();

  useEffect(() => {
    scrollToTop(true);
  }, [location.pathname]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:font-mono focus:text-[11px] focus:uppercase focus:tracking-[0.16em] focus:text-void"
      >
        Skip to content
      </a>

      <WebGLBackground />
      <ScrollProgress />
      <Nav />

      <main id="main" className="relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<Browse type="movie" />} />
            <Route path="/series" element={<Browse type="series" />} />
            <Route path="/search" element={<Search />} />
            <Route path="/search/:q" element={<Search />} />
            <Route path="/title/:type/:id" element={<Detail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
      <TabBar />
      <Grain />
    </>
  );
}

export function App() {
  return (
    <HashRouter>
      <SmoothScroll />
      <Shell />
    </HashRouter>
  );
}
