import type { DefeatKind, Difficulty, StatKey, VectorZone } from '../core/types';

/** A titled flavor block used by defeat/victory end screens. */
export interface RankText {
  title: string;
  text: string;
}

/** Reform branch keys (mirror of Reform['branch']). */
export type BranchKey = 'economy' | 'force' | 'social' | 'propaganda';

/** Victory rank keys resolved from average stats + zone (see victoryRankKey).
 * 'steppedDown' is the canonical good ending — voluntarily leaving power, undefeated. */
export type VictoryRankKey =
  | 'steppedDown'
  | 'fatherDemocracy'
  | 'fatherNation'
  | 'manager'
  | 'okay'
  | 'survived';

/**
 * All fixed (non per-content) user-facing strings for one language.
 * Per-item content flavor (reforms/events/country) is localized inline in data/;
 * everything enumerable and reusable lives here.
 */
export interface Ui {
  menu: {
    /** Two-line title, «Глава / государства». */
    title: [string, string];
    subtitle: string;
    continue: string;
    difficulties: Record<Difficulty, { name: string; tagline: string }>;
    /** Kicker above the title — «Кабинет президента». */
    kicker: string;
    /** Menu list row that starts a new game. */
    newGame: string;
    /** «срок» in the continue row's value «Абсурдистан, срок II». */
    termShort: string;
    /** Footer line at the bottom-left. */
    footer: string;
  };
  /** Dedicated screen between the main menu and the map: pick Easy/Medium/Hard before picking
   * a country, instead of choosing it inline in the country dossier (see ARCHITECTURE.md). */
  difficulty: {
    title: string;
    /** Advances to the map, carrying the chosen difficulty forward. */
    next: string;
  };
  /** Europe map / country selection screen and its drawer, between menu and playing. */
  map: {
    /** MenuScreen's single "Play" button — navigates to the map. */
    playCta: string;
    /** Accessibility/fallback searchable list of the same countries as the map. */
    listButton: string;
    /** Shown briefly while the map screen's code chunk (lazy-loaded) downloads. */
    loading: string;
    searchPlaceholder: string;
    close: string;
    /** Region names — shown as the hover/tap tooltip for any country at the world-map
     * overview (before a region is entered), and as the active-region heading afterward. */
    continents: {
      westernEurope: string;
      easternEurope: string;
      northAmerica: string;
      southAmerica: string;
      centralAsia: string;
      middleEast: string;
      southSoutheastAsia: string;
      easternAsia: string;
      oceania: string;
      northAfrica: string;
      westernAfrica: string;
      centralAfrica: string;
      easternAfrica: string;
      southernAfrica: string;
    };
    /** Shown over the map, only at the world overview (before a region is entered). */
    chooseRegion: string;
    /** Back button: exits the active region, returning to the world overview. */
    backToRegions: string;
    dossier: {
      population: string;
      /** Abbreviation unit for population once it crosses a million, e.g. «млн». */
      populationMillion: string;
      area: string;
      economy: string;
      corruption: string;
      democracy: string;
      development: string;
      /** Read-only readout of the difficulty already chosen on DifficultyScreen, shown right
       * above "Choose" — not a control; see ui.difficulty for where it's actually picked. */
      difficulty: string;
    };
    /** Primary button in the country drawer that starts the game. */
    choose: string;
    /** The inline rail's other state: a region is active but no country picked yet — shows an
     * overview of the region (member count, summed population/area, averaged levels) instead
     * of one country's dossier. Reuses `dossier`'s population/area/economy/corruption/
     * democracy/development labels for its own rows — same concepts, aggregated. */
    /** Desktop zoom control: two-line hint («Колесо мыши —
масштаб карты») and button labels. */
    zoomHint: string;
    zoomIn: string;
    zoomOut: string;
    /** Desktop search pill placeholder, «Поиск страны». */
    searchPill: string;
    /** Country card kicker, «Выбор страны». */
    kicker: string;
    /** Bottom-right hint, «Выберите страну на карте или из списка». */
    hint: string;
    /** Country card meta line pieces: «… · 447 тыс. км² · без выхода к морю · ресурсы 60». */
    meta: { thousandKm2: string; km2: string; seaAccess: string; landlocked: string; resources: string };
    regionInfo: {
      /** Row label for the region's member-country count. */
      countries: string;
      /** Caption prompting the player toward the next step, in place of a country's description. */
      hint: string;
    };
  };
  /** Settings screen, reached from the main menu. A master->detail hub: a 3-row menu
   * (Language/Theme/Reference) over local `view` state, not flat panels. */
  settings: {
    /** Screen header, and the label of the menu button that opens it; also the menu view's nav row label. */
    title: string;
    /** Menu view's nav row label + detail header title. */
    language: string;
    /** Italic hint under the language choices. */
    languageHint: string;
    /** Menu view's nav row label + detail header title. */
    theme: string;
    themeOptions: { light: string; dark: string; system: string };
    /** Italic hint under the theme choices. */
    themeHint: string;
    /** Menu view's "Справка" row current-value text (the row label itself is help.title). */
    referenceValue: string;
    /** Italic footer under the settings hub list. */
    footer: string;
  };
  /** Full-screen overlay shown on phone-sized portrait viewports (see OrientationGate) —
   * the game is landscape-only on phones; this is the web fallback for orientation lock. */
  orientationGate: {
    title: string;
    hint: string;
  };
  main: {
    /** «влияние» — header label before the influence points. */
    influence: string;
    brief: string;
    reforms: string;
    autosave: string;
    /** «Срок» — the term counter shown in the header. */
    term: string;
    /** «до выборов» — months remaining until the next election. */
    untilElection: string;
    /** Short month unit, e.g. «мес.». */
    monthsShort: string;
    /** Aria labels for the real-time clock controls. */
    speed: { pause: string; normal: string; fast: string };
    /** «из» in the header's «Срок I · 19 из 48». */
    of: string;
    /** Stats panel kicker, «Показатели». */
    statsKicker: string;
    /** Shortened stat labels for the compact glass stats panel («Народ», «Элиты», …). */
    statsShort: Record<StatKey, string>;
    /** Bottom bar clock caption: running («время идёт») / paused («время стоит»). */
    timeRunning: string;
    timePaused: string;
    /** Under the player's country label on the map — only for the fictional Absurdistan. */
    bordersNote: string;
    /** Top-right «Повестка» panel: what currently needs the ruler's attention. */
    agenda: {
      kicker: string;
      calm: { title: string; flavor: string };
      /** An event is waiting; the title is the event's own title. */
      eventFlavor: string;
      danger: { title: string; flavor: string };
      election: { title: string; flavor: string };
    };
    /** Bottom ticker: kicker, the prefix for adopted reforms, and filler headlines. */
    news: { kicker: string; decree: string; filler: string[] };
  };
  /** Inter-term inauguration summary shown after winning re-election. */
  interTerm: {
    stamp: string;
    flavor: string;
    continue: string;
  };
  /** Month names, index 0 = January … 11 = December. */
  months: string[];
  vector: {
    heading: string;
    zones: Record<VectorZone, string>;
    scale: { democracy: string; authoritarianism: string; totalitarianism: string };
    /** Reforms vector panel trend caption; {n} = months, {d} = absolute shift. */
    trend: { right: string; left: string; still: string };
    /** Reforms vector panel «Если принять» preview of the selected reform's vector effect. */
    preview: {
      kicker: string;
      /** «вектор {d}» — {d} is the signed shift. */
      shift: string;
      toDemocracy: string;
      toTotalitarianism: string;
      none: string;
      flavor: string;
      flavorNone: string;
    };
  };
  /** Medals (handoff screen 11) — names/conditions themselves are LocalizedText in data/medals.ts. */
  medals: {
    title: string;
    /** Menu row value, «{n} из {total}». */
    count: string;
    /** Top bar meta, «получено {n} из {total}». */
    meta: string;
    /** Main screen bottom bar prefix, «Медаль». */
    latest: string;
    /** Game over line prefix, «Новые медали:». */
    newOnGameOver: string;
    /** Screen-reader state for a medal not yet earned. */
    locked: string;
  };
  /** Event dialog chrome (handoff screen 04). */
  event: {
    /** Kicker prefix, «Событие». */
    kicker: string;
    /** Kicker suffix per event kind («донесение», «срочно», «из-за рубежа»). */
    kinds: { random: string; triggered: string; external: string };
    footer: string;
    /** Stamp that lands on the chosen option. */
    signed: string;
  };
  stats: Record<StatKey, string>;
  branches: Record<BranchKey, string>;
  reformsPanel: {
    title: string;
    close: string;
    influencePoints: string;
    treasury: string;
    adopted: string;
    costInfluence: string;
    costTreasury: string;
    approve: string;
    locked: string;
    tier: string;
    /** Detail key-value row label, «Стоимость». */
    cost: string;
    /** Locked node status, «закрыто». */
    lockedShort: string;
    effectsInstant: string;
    effectsPerMonth: string;
    /** Reason lines shown under a disabled approve button (mirror core ReformBlock). */
    reason: {
      needsPrevious: string;
      notEnoughInfluence: string;
      notEnoughTreasury: string;
    };
  };
  trend: string;
  gameOver: {
    /** Masthead kicker above the 3px rule, e.g. «Итоговый выпуск · По завершении срока». */
    kicker: string;
    stampVictory: string;
    stampDefeat: string;
    survived: string;
    playAgain: string;
    toMenu: string;
  };
  defeat: Record<DefeatKind, RankText>;
  victory: Record<VictoryRankKey, RankText>;
  /** First-time-user tutorial: the entry prompt and the advisor panel's fixed chrome.
   * Scripted-step/tip flavor text itself is LocalizedText data in ui/tutorial/content.ts,
   * not here — this is only the reusable button/label strings around it. */
  tutorial: {
    /** «Советник» — the advisor panel's speaker label. */
    advisorLabel: string;
    /** Advances a scripted step or dismisses a tip. */
    next: string;
    /** Abandons the scripted opening early; also the Settings restart button's neighbor. */
    skip: string;
    prompt: {
      title: string;
      start: string;
      skip: string;
    };
    /** Settings screen button: resets the completed flag and seen-tips set. */
    restart: string;
    /** Coach card kicker, «Обучение · шаг {n} из {total}». */
    stepKicker: string;
    /** Last scripted step's button, «Начать игру». */
    finish: string;
  };
  /** Static «Справка» reference screen, reached from Settings — the "re-read later" layer.
   * Terse by design; sourced entirely from ui strings, not GDD prose. */
  help: {
    title: string;
    stats: {
      heading: string;
      economy: string;
      treasury: string;
      approval: string;
      eliteLoyalty: string;
      stability: string;
      development: string;
      corruption: string;
    };
    vector: {
      heading: string;
      democratic: string;
      authoritarian: string;
      totalitarian: string;
    };
    elections: { heading: string; text: string };
    defeats: {
      heading: string;
      coup: string;
      revolution: string;
      default: string;
      elections: string;
    };
    reforms: { heading: string; text: string };
  };
}
