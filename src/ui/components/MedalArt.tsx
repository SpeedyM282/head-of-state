/**
 * Medal artwork from the medals design handoffs (design_handoff_medals for medals 1–8,
 * design_handoff_medals_new for 9–24): a woven ribbon bar, a ring and a metal badge, as 100×150
 * SVGs in four variants — light/dark theme × earned/locked. The second handoff uses our ids; the
 * first used its own, hence the alias map below.
 */

const FILES = import.meta.glob<string>('../../assets/medals/*.svg', { eager: true, query: '?url', import: 'default' });

/** Our medal id (data/medals.ts) → the artwork id, where they differ (first handoff only). */
const ART_ALIAS: Readonly<Record<string, string>> = {
  'hundred-quiet-days': 'hundred-days',
  'peoples-favourite': 'peoples-favorite',
  'top-of-the-branch': 'reformer',
  'iron-fist': 'iron-hand',
  'second-wind': 'second-term',
  'invisible-hand': 'strong-manager',
  'left-undefeated': 'no-scandal',
};

function fileUrl(art: string, theme: 'light' | 'dark', state: 'earned' | 'locked'): string | undefined {
  return FILES[`../../assets/medals/${art}-${theme}-${state}.svg`];
}

/** The artwork id for one of our medal ids. */
export function medalArtId(medalId: string): string {
  return ART_ALIAS[medalId] ?? medalId;
}

/** URLs of a medal's four SVG variants (undefined where a file is missing). */
export function medalArtUrls(medalId: string) {
  const art = medalArtId(medalId);
  return {
    lightEarned: fileUrl(art, 'light', 'earned'),
    lightLocked: fileUrl(art, 'light', 'locked'),
    darkEarned: fileUrl(art, 'dark', 'earned'),
    darkLocked: fileUrl(art, 'dark', 'locked'),
  };
}

/**
 * The medal image at the size given by `className` (keep the 2:3 aspect). Both theme variants
 * are rendered and CSS shows the one matching the active theme (.theme-light-only /
 * .theme-dark-only), so a theme switch needs no re-render.
 */
export function MedalArt({ medalId, earned, className = '' }: { medalId: string; earned: boolean; className?: string }) {
  const art = medalArtId(medalId);
  const state = earned ? 'earned' : 'locked';
  const light = fileUrl(art, 'light', state);
  const dark = fileUrl(art, 'dark', state);
  return (
    <span className={`relative block shrink-0 ${className}`} aria-hidden>
      {light && <img src={light} alt="" draggable={false} className="theme-light-only absolute inset-0 h-full w-full" />}
      {dark && <img src={dark} alt="" draggable={false} className="theme-dark-only absolute inset-0 h-full w-full" />}
    </span>
  );
}
