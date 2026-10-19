import { describe, expect, it } from 'vitest';
import { MEDALS } from '../../src/data/medals';
import { medalArtUrls } from '../../src/ui/components/MedalArt';

describe('medal artwork', () => {
  it.each(MEDALS.map((m) => m.id))('%s has all four SVG variants', (id) => {
    const urls = medalArtUrls(id);
    expect(urls.lightEarned).toBeDefined();
    expect(urls.lightLocked).toBeDefined();
    expect(urls.darkEarned).toBeDefined();
    expect(urls.darkLocked).toBeDefined();
  });
});
