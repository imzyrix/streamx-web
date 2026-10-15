import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createPortal } from "react-dom";
import { getLenis } from "../lib/lenis";
import { Icon } from "./Icon";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Wider shell for media (trailers) and long-form content (person). */
  size?: "md" | "lg" | "xl";
  /** Render the body without the default padded chrome (for iframes). */
  bare?: boolean;
}

const WIDTHS = { md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" } as const;

export function Modal({ open, onClose, title, children, size = "lg", bare = false }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    const lenis = getLenis();
    lenis?.stop();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => closeRef.current?.focus(), 60);

    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
      lenis?.start();
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="modal"
          className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-void/80 backdrop-blur-md"
          />
          <motion.div
            ref={panelRef}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.99 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-10 w-full ${WIDTHS[size]} max-h-[92dvh] overflow-hidden rounded-t-card border border-line-2 bg-panel shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] sm:rounded-card`}
          >
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
              <h2 className="truncate font-mono text-[11px] uppercase tracking-[0.2em] text-mute">{title}</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line-2 text-ink transition-colors duration-300 hover:border-ink"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <div className={bare ? "" : "max-h-[calc(92dvh-3.5rem)] overflow-y-auto px-5 py-5"}>{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
