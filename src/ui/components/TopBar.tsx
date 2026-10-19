import type { ReactNode } from 'react';

/** «Кабинет» top bar for full-screen sub-views (settings, reforms, medals): a bordered back
 * button, a Spectral title, optional right-aligned meta and/or an action button. No rule below
 * it — whitespace separates it from the content (handoff → Lines). */
export function TopBar({ title, onBack, backLabel, meta, action }: { title: string; onBack: () => void; backLabel: string; meta?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex shrink-0 items-center gap-sp-3">
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        // min-h-9 touch target (the mock's 26pt box scales to ~36px); the glyph box is the button.
        className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-chip border border-(--line) text-label"
      >
        <span aria-hidden>←</span>
      </button>
      <h1 className="min-w-0 flex-1 truncate font-serif text-heading leading-tight">{title}</h1>
      {meta && <div className="shrink-0 text-caption text-(--muted) desktop:text-dp-19">{meta}</div>}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
