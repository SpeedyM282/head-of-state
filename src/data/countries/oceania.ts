import type { CountryProfile } from '../../core/types';

/**
 * Approximate, general-knowledge buckets (0-100), not sourced per-country — same approach
 * as `europe.ts`/`americas.ts`/`asia.ts`. Differentiation between countries is the goal, not
 * precision:
 *  - economyLevel: GDP-per-capita bucket
 *  - corruptionLevel: inverted CPI (Corruption Perceptions Index) bucket — higher = more corrupt
 *  - democracyLevel: Democracy Index bucket — higher = more democratic
 *  - developmentLevel: HDI (Human Development Index) bucket
 * Descriptions are neutral and factual (geography/economy only) per GDD §12.
 *
 * The full set of Oceania sovereign states with a usable shape in the 110m topology. Smaller
 * Pacific island nations (Kiribati, Tonga, Samoa, Micronesia, Palau, Marshall Islands, Tuvalu,
 * Nauru) have no shape at this resolution and are therefore not selectable — same constraint
 * that already excludes Europe's microstates.
 */
export const oceaniaCountries: CountryProfile[] = [
  // ─── Australia and New Zealand ───
  {
    id: 'au',
    name: { en: 'Australia', ru: 'Австралия', uz: 'Avstraliya' },
    description: {
      en: 'The only country that is also a continent, with a highly developed economy built on mining exports, agriculture and services.',
      ru: 'Единственная страна, являющаяся также континентом; высокоразвитая экономика опирается на экспорт полезных ископаемых, сельское хозяйство и сферу услуг.',
      uz: 'Bir vaqtning o‘zida qit’a ham bo‘lgan yagona davlat; yuqori rivojlangan iqtisodiyoti foydali qazilmalar eksporti, qishloq xo‘jaligi va xizmat ko‘rsatish sohasiga tayanadi.',
    },
    flagEmoji: '🇦🇺',
    population: 26_600_000,
    areaKm2: 7_692_024,
    resources: 65,
    hasSeaAccess: true,
    economyLevel: 72,
    corruptionLevel: 22,
    democracyLevel: 88,
    developmentLevel: 93,
  },
  {
    id: 'nz',
    name: { en: 'New Zealand', ru: 'Новая Зеландия', uz: 'Yangi Zelandiya' },
    description: {
      en: 'A remote island nation in the South Pacific known for its mountainous landscapes, with an economy centered on agriculture, dairy exports and tourism.',
      ru: 'Удалённое островное государство в южной части Тихого океана, известное горными пейзажами; экономика опирается на сельское хозяйство, экспорт молочной продукции и туризм.',
      uz: 'Tinch okeanining janubiy qismidagi tog‘li manzaralari bilan mashhur uzoq orol davlati; iqtisodiyoti qishloq xo‘jaligi, sut mahsulotlari eksporti va turizmga asoslangan.',
    },
    flagEmoji: '🇳🇿',
    population: 5_200_000,
    areaKm2: 268_021,
    resources: 40,
    hasSeaAccess: true,
    economyLevel: 66,
    corruptionLevel: 12,
    democracyLevel: 92,
    developmentLevel: 91,
  },

  // ─── Melanesia ───
  {
    id: 'pg',
    name: { en: 'Papua New Guinea', ru: 'Папуа — Новая Гвинея', uz: 'Papua — Yangi Gvineya' },
    description: {
      en: 'A mountainous, linguistically diverse country occupying the eastern half of New Guinea, with an economy based on mining, natural gas and subsistence agriculture.',
      ru: 'Гористая, лингвистически многообразная страна, занимающая восточную половину острова Новая Гвинея; экономика основана на горнодобыче, природном газе и натуральном сельском хозяйстве.',
      uz: 'Yangi Gvineya orolining sharqiy yarmini egallagan tog‘li, tillar jihatidan xilma-xil davlat; iqtisodiyoti konchilik, tabiiy gaz va tirikchilik uchun qishloq xo‘jaligiga asoslangan.',
    },
    flagEmoji: '🇵🇬',
    population: 10_300_000,
    areaKm2: 462_840,
    resources: 60,
    hasSeaAccess: true,
    economyLevel: 22,
    corruptionLevel: 75,
    democracyLevel: 48,
    developmentLevel: 45,
  },
  {
    id: 'fj',
    name: { en: 'Fiji', ru: 'Фиджи', uz: 'Fiji' },
    description: {
      en: 'An archipelago in the South Pacific whose economy relies on tourism, sugar exports and a growing services sector.',
      ru: 'Архипелаг в южной части Тихого океана, экономика которого опирается на туризм, экспорт сахара и растущий сектор услуг.',
      uz: 'Tinch okeanining janubiy qismidagi arxipelag; iqtisodiyoti turizm, shakar eksporti va o‘sib borayotgan xizmat ko‘rsatish sektoriga tayanadi.',
    },
    flagEmoji: '🇫🇯',
    population: 930_000,
    areaKm2: 18_274,
    resources: 20,
    hasSeaAccess: true,
    economyLevel: 35,
    corruptionLevel: 48,
    democracyLevel: 50,
    developmentLevel: 62,
  },
  {
    id: 'sb',
    name: { en: 'Solomon Islands', ru: 'Соломоновы Острова', uz: 'Solomon orollari' },
    description: {
      en: 'A Melanesian archipelago whose economy depends on logging, fishing and subsistence agriculture, with limited infrastructure across its many islands.',
      ru: 'Меланезийский архипелаг, экономика которого зависит от лесозаготовок, рыболовства и натурального сельского хозяйства; инфраструктура на многочисленных островах ограничена.',
      uz: 'Iqtisodiyoti yog‘ochni qayta ishlash, baliqchilik va tirikchilik uchun qishloq xo‘jaligiga bog‘liq Melaneziya arxipelagi; ko‘plab orollarida infratuzilma cheklangan.',
    },
    flagEmoji: '🇸🇧',
    population: 740_000,
    areaKm2: 28_896,
    resources: 30,
    hasSeaAccess: true,
    economyLevel: 15,
    corruptionLevel: 68,
    democracyLevel: 45,
    developmentLevel: 48,
  },
  {
    id: 'vu',
    name: { en: 'Vanuatu', ru: 'Вануату', uz: 'Vanuatu' },
    description: {
      en: 'A volcanic archipelago in the South Pacific with an economy based on tourism, agriculture and offshore financial services.',
      ru: 'Вулканический архипелаг в южной части Тихого океана с экономикой, основанной на туризме, сельском хозяйстве и офшорных финансовых услугах.',
      uz: 'Tinch okeanining janubiy qismidagi vulqonli arxipelag; iqtisodiyoti turizm, qishloq xo‘jaligi va oflayn moliyaviy xizmatlarga asoslangan.',
    },
    flagEmoji: '🇻🇺',
    population: 330_000,
    areaKm2: 12_189,
    resources: 15,
    hasSeaAccess: true,
    economyLevel: 18,
    corruptionLevel: 50,
    democracyLevel: 55,
    developmentLevel: 52,
  },
];
