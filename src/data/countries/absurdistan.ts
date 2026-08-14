import type { CountryProfile } from '../../core/types';

export const absurdistan: CountryProfile = {
  id: 'absurdistan',
  name: {
    en: 'Republic of Absurdistan',
    ru: 'Республика Абсурдистан',
    uz: 'Absurdiston Respublikasi',
  },
  description: {
    en: 'A fictional country of no fixed geography. Any resemblance to real states is coincidental — this is the tutorial nation.',
    ru: 'Вымышленная страна без строгой географии. Любые совпадения со странами случайны — это тренировочная нация.',
    uz: 'Aniq geografiyasi bo’lmagan xayoliy davlat. Haqiqiy davlatlar bilan o’xshashlik tasodifiy — bu o’quv davlati.',
  },
  flagEmoji: '🏴',
  population: 34_000_000,
  areaKm2: 447_000,
  resources: 60,
  hasSeaAccess: false,
  // Baseline matches the `normal` difficulty's legacy absolute start values exactly, so
  // normal-difficulty games are byte-identical to pre-country-select behavior.
  economyLevel: 50,
  corruptionLevel: 30,
  democracyLevel: 50,
  developmentLevel: 45,
};
