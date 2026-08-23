import type { CSSProperties } from 'react';

interface Props {
  value: number | string;
  /** Font-size/weight/line-height — these differ per usage (influence on MainScreen, months
   * survived on GameOverScreen), so they're the caller's concern rather than a component prop. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The gazette's hero-figure treatment for a headline number: four offset copies of the same
 * digits fake a misregistered four-color-process print (see .cmyk-num in index.css for the
 * actual mechanism — a paper-colored base plate plus three multiply-blended process-ink
 * copies, each nudged a subpixel). Purely decorative duplication, so the three color plates
 * are aria-hidden; only the base plate's digits are exposed to assistive tech.
 */
export function CmykNumeral({ value, className, style }: Props) {
  const text = String(value);
  return (
    <span className={`cmyk-num${className ? ` ${className}` : ''}`} style={style}>
      <span className="paper">{text}</span>
      <span className="plate plate-c" aria-hidden="true">{text}</span>
      <span className="plate plate-m" aria-hidden="true">{text}</span>
      <span className="plate plate-y" aria-hidden="true">{text}</span>
    </span>
  );
}
