import type { CountryProfile } from '../../core/types';
import { absurdistan } from './absurdistan';
import { europeCountries } from './europe';
import { americasCountries } from './americas';
import { asiaCountries } from './asia';
import { oceaniaCountries } from './oceania';

export const countries: CountryProfile[] = [
  absurdistan,
  ...europeCountries,
  ...americasCountries,
  ...asiaCountries,
  ...oceaniaCountries,
];

export function getCountryById(id: string): CountryProfile {
  return countries.find((c) => c.id === id) ?? absurdistan;
}
