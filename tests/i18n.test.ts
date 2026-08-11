import { describe, expect, it } from 'vitest';
import type { Lang, LocalizedText } from '../src/core/types';
import {
  DEFAULT_LANG,
  LANGS,
  format,
  loc,
  uiStrings,
  victoryRankKey,
} from '../src/i18n';
import { absurdistan } from '../src/data/countries/absurdistan';
import { reforms } from '../src/data/reforms';
import { events } from '../src/data/events';

/** Every LocalizedText in the game content, flattened. */
function contentTexts(): { label: string; text: LocalizedText }[] {
  const out: { label: string; text: LocalizedText }[] = [];
  out.push({ label: 'country.name', text: absurdistan.name });
  for (const r of reforms) {
    out.push({ label: `reform ${r.id} title`, text: r.title });
    out.push({ label: `reform ${r.id} description`, text: r.description });
  }
  for (const e of events) {
    out.push({ label: `event ${e.id} title`, text: e.title });
    out.push({ label: `event ${e.id} text`, text: e.text });
    e.options.forEach((o, i) => out.push({ label: `event ${e.id} option ${i}`, text: o.text }));
  }
  return out;
}

/** Recursively collect every leaf string from a nested string object. */
function leafStrings(obj: unknown, path: string, sink: { path: string; value: string }[]): void {
  if (typeof obj === 'string') {
    sink.push({ path, value: obj });
  } else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) leafStrings(v, `${path}.${k}`, sink);
  }
}

describe('i18n config', () => {
  it('supports exactly en/ru/uz with en as default', () => {
    expect(LANGS).toEqual(['en', 'ru', 'uz']);
    expect(DEFAULT_LANG).toBe('en');
  });
});

describe('content is fully localized', () => {
  it('every content string exists and is non-empty in all languages', () => {
    for (const { label, text } of contentTexts()) {
      for (const lang of LANGS) {
        const value = text[lang];
        expect(typeof value, `${label} [${lang}]`).toBe('string');
        expect(value.trim().length, `${label} [${lang}] is empty`).toBeGreaterThan(0);
      }
    }
  });
});

describe('ui strings are fully localized', () => {
  it('no ui string is empty in any language', () => {
    for (const lang of LANGS) {
      const sink: { path: string; value: string }[] = [];
      leafStrings(uiStrings[lang], lang, sink);
      expect(sink.length).toBeGreaterThan(0);
      for (const { path, value } of sink) {
        expect(value.trim().length, `${path} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('all languages share the same ui string key structure', () => {
    const paths = (lang: Lang) => {
      const sink: { path: string; value: string }[] = [];
      leafStrings(uiStrings[lang], '', sink);
      return sink.map((s) => s.path).sort();
    };
    const base = paths('en');
    for (const lang of LANGS) expect(paths(lang), `keys differ for ${lang}`).toEqual(base);
  });
});

describe('i18n helpers', () => {
  it('loc selects the requested language', () => {
    const t: LocalizedText = { en: 'A', ru: 'Б', uz: 'V' };
    expect(loc(t, 'en')).toBe('A');
    expect(loc(t, 'ru')).toBe('Б');
    expect(loc(t, 'uz')).toBe('V');
  });

  it('format fills placeholders', () => {
    expect(format('Q{q} {year}', { q: 2, year: 2026 })).toBe('Q2 2026');
    expect(format('no tokens', {})).toBe('no tokens');
  });

  it('victoryRankKey follows GDD §9 thresholds', () => {
    // A thriving country you stepped down from earns the canonical top rank, any zone.
    expect(victoryRankKey(80, 'democratic')).toBe('steppedDown');
    expect(victoryRankKey(80, 'totalitarian')).toBe('steppedDown');
    // Below the top tier, the rank is zone-flavored.
    expect(victoryRankKey(65, 'democratic')).toBe('fatherDemocracy');
    expect(victoryRankKey(65, 'totalitarian')).toBe('fatherNation');
    expect(victoryRankKey(65, 'authoritarian')).toBe('manager');
    expect(victoryRankKey(50, 'democratic')).toBe('okay');
    expect(victoryRankKey(20, 'democratic')).toBe('survived');
  });
});
