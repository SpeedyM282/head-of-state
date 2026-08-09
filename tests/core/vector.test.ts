import { describe, expect, it } from 'vitest';
import { vectorZone } from '../../src/core/vector';

describe('vectorZone', () => {
  it('maps boundaries per GDD §5', () => {
    expect(vectorZone(0)).toBe('democratic');
    expect(vectorZone(33)).toBe('democratic');
    expect(vectorZone(34)).toBe('authoritarian');
    expect(vectorZone(66)).toBe('authoritarian');
    expect(vectorZone(67)).toBe('totalitarian');
    expect(vectorZone(100)).toBe('totalitarian');
  });
});
