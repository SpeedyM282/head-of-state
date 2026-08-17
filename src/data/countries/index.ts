import type { CountryProfile } from '../../core/types';
import { absurdistan } from './absurdistan';
import { europeCountries } from './europe';
import { americasCountries } from './americas';
import { asiaCountries } from './asia';
import { oceaniaCountries } from './oceania';
import { africaCountries } from './africa';

export const countries: CountryProfile[] = [
  absurdistan,
  ...europeCountries,
  ...americasCountries,
  ...asiaCountries,
  ...oceaniaCountries,
  ...africaCountries,
];

export function getCountryById(id: string): CountryProfile {
  return countries.find((c) => c.id === id) ?? absurdistan;
}
