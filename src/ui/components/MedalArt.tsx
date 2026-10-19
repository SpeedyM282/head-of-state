/**
 * Medal artwork from the medals design handoff (design_handoff_medals): a woven ribbon bar, a
 * ring and a metal badge, as 100×150 SVGs in four variants — light/dark theme × earned/locked.
 * Only 8 medals have art so far; the rest keep the plain ring-and-disc circle (see
 * MedalsScreen). The handoff's own ids differ from ours, hence the map below.
 */

const FILES = import.meta.glob<string>('../../assets/medals/*.svg', { eager: true, query: '?url', import: 'default' });

/** Our medal id (data/medals.ts) → the handoff artwork id. */
const ART_FOR_MEDAL: Readonly<Record<string, string>> = {
  'first-decree': 'first-decree',
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

/** Whether a medal has handoff artwork (otherwise the caller draws the plain circle). */
export function hasMedalArt(medalId: string): boolean {
  return medalId in ART_FOR_MEDAL;
}

/**
 * The medal image at the size given by `className` (keep the 2:3 aspect). Both theme variants
 * are rendered and CSS shows the one matching the active theme (.theme-light-only /
 * .theme-dark-only), so a theme switch needs no re-render.
 */
export function MedalArt({ medalId, earned, className = '' }: { medalId: string; earned: boolean; className?: string }) {
  const art = ART_FOR_MEDAL[medalId];
  if (!art) return null;
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
