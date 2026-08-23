interface Props {
  label: string;
  value: string;
}

/** Pre-game dossier row (country levels, not live Stats) — a plain ledger row (label ‹dotted
 * leader› value), the same .led/.led-dots primitive MainScreen's StatRow uses, so the country
 * dossier and the in-game stat ledger read as one consistent register-book idiom. No bar, no
 * danger/inverted coloring: unlike a live Stats reading, a dossier level is just a descriptive
 * baseline with no defeat threshold to warn against — the mock shows all four levels
 * (including corruption) styled identically. `value` is caller-formatted (numbers, "34 млн",
 * "447 000 km²", ...) rather than a raw number, since CountryDossier's rows aren't all counts. */
export function LevelBar({ label, value }: Props) {
  return (
    <div className="led text-caption">
      <span className="shrink-0">{label}</span>
      <span className="led-dots" aria-hidden />
      <span className="num shrink-0">{value}</span>
    </div>
  );
}
