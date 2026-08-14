import type { CountryProfile } from '../../core/types';
import { absurdistan } from './absurdistan';
import { europeCountries } from './europe';

export const countries: CountryProfile[] = [absurdistan, ...europeCountries];

export function getCountryById(id: string): CountryProfile {
  return countries.find((c) => c.id === id) ?? absurdistan;
}
