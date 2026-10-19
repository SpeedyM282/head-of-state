import type { DefeatKind, GameContent, GameState, LocalizedText, Reform } from '../core/types';
import { vectorZone } from '../core';

/** What a medal check can see: the live game, its content, and the cross-game defeat history
 * (with the current game's defeat, if any, already folded in). */
export interface MedalContext {
  state: GameState;
  content: GameContent;
  defeatsSeen: readonly DefeatKind[];
}

export interface MedalDef {
  id: string;
  name: LocalizedText;
  /** The unlock condition as shown on the Медали screen. */
  condition: LocalizedText;
  /** Pure predicate — true once the medal is earned. Checked after every game update; an
   * earned medal stays earned (see store/medalStore.ts). */
  check: (ctx: MedalContext) => boolean;
}

/** Thresholds for the stat/vector medals — meta-progression flavor, not game balance, so they
 * live with the medals rather than in balance.ts. */
const T = {
  quietMonths: 3,
  longReignMonths: 240,
  reformist: 10,
  crisisEvents: 25,
  economyHigh: 80,
  treasuryFull: 90,
  approvalHigh: 85,
  eliteHigh: 90,
  corruptionClean: 10,
  corruptionCaptured: 80,
  calmStat: 60,
  calmCorruption: 40,
  vectorDemocrat: 10,
  vectorIron: 90,
} as const;

const owned = (ctx: MedalContext): Reform[] =>
  ctx.state.ownedReforms.flatMap((id) => ctx.content.reforms.filter((r) => r.id === id));

const inPower = (ctx: MedalContext) => ctx.state.outcome === null;

/** Won an election and now sits at the inter-term inauguration, in the given zone. */
const wonElectionIn = (ctx: MedalContext, zone: ReturnType<typeof vectorZone>) =>
  ctx.state.awaitingInauguration && vectorZone(ctx.state.vector) === zone;

export const MEDALS: MedalDef[] = [
  {
    id: 'first-decree',
    name: { en: 'First Decree', ru: 'Первый указ', uz: 'Birinchi farmon' },
    condition: { en: 'Adopt your first reform', ru: 'Принять первую реформу', uz: 'Birinchi islohotni qabul qilish' },
    check: (ctx) => ctx.state.ownedReforms.length >= 1,
  },
  {
    id: 'hundred-quiet-days',
    name: { en: 'A Hundred Quiet Days', ru: 'Сто дней тишины', uz: 'Yuz kunlik sukunat' },
    condition: { en: 'Last 3 months without a single reform', ru: 'Продержаться 3 месяца, не приняв ни одной реформы', uz: 'Birorta islohotsiz 3 oy turish' },
    check: (ctx) => ctx.state.turn >= T.quietMonths && ctx.state.ownedReforms.length === 0,
  },
  {
    id: 'full-term',
    name: { en: 'Full Term', ru: 'Полный срок', uz: 'To‘liq muddat' },
    condition: { en: 'Reach the end of your first term', ru: 'Доработать первый срок до конца', uz: 'Birinchi muddatni oxirigacha ishlash' },
    check: (ctx) => ctx.state.turn >= ctx.content.difficulty.turnsToWin,
  },
  {
    id: 'second-wind',
    name: { en: 'Second Wind', ru: 'Второе дыхание', uz: 'Ikkinchi nafas' },
    condition: { en: 'Win an election and start a second term', ru: 'Выиграть выборы и начать второй срок', uz: 'Saylovda g‘alaba qozonib, ikkinchi muddatni boshlash' },
    check: (ctx) => ctx.state.term >= 2,
  },
  {
    id: 'constitutional-genius',
    name: { en: 'Constitutional Genius', ru: 'Конституционный гений', uz: 'Konstitutsiya dahosi' },
    condition: { en: 'Amend the constitution', ru: 'Изменить конституцию', uz: 'Konstitutsiyani o‘zgartirish' },
    check: (ctx) => ctx.state.constitutionAmended,
  },
  {
    id: 'left-undefeated',
    name: { en: 'Left Undefeated', ru: 'Ушёл непобеждённым', uz: 'Mag‘lubiyatsiz ketdi' },
    condition: { en: 'Step down on your own', ru: 'Уйти в отставку самому', uz: 'O‘z ixtiyori bilan iste’foga chiqish' },
    check: (ctx) => ctx.state.outcome?.result === 'victory',
  },
  {
    id: 'long-reign',
    name: { en: 'Long Reign', ru: 'Долгожитель', uz: 'Uzoq hukmdor' },
    condition: { en: 'Stay in power for 240 months', ru: 'Продержаться у власти 240 месяцев', uz: 'Hokimiyatda 240 oy turish' },
    check: (ctx) => ctx.state.turn >= T.longReignMonths,
  },
  {
    id: 'reformist',
    name: { en: 'Reformist', ru: 'Реформатор', uz: 'Islohotchi' },
    condition: { en: 'Adopt 10 reforms in one game', ru: 'Принять 10 реформ за одну игру', uz: 'Bir o‘yinda 10 ta islohot qabul qilish' },
    check: (ctx) => ctx.state.ownedReforms.length >= T.reformist,
  },
  {
    id: 'top-of-the-branch',
    name: { en: 'Top of the Branch', ru: 'Вершина ветки', uz: 'Tarmoq cho‘qqisi' },
    condition: { en: 'Adopt the last level of any branch', ru: 'Принять последний уровень любой ветки', uz: 'Istalgan tarmoqning oxirgi darajasini qabul qilish' },
    check: (ctx) =>
      owned(ctx).some((r) => r.tier === Math.max(...ctx.content.reforms.filter((x) => x.branch === r.branch).map((x) => x.tier))),
  },
  {
    id: 'all-branches',
    name: { en: 'All Branches of Power', ru: 'Все ветви власти', uz: 'Hokimiyatning barcha tarmoqlari' },
    condition: { en: 'Adopt a reform in each of the four branches', ru: 'Принять реформу в каждой из четырёх ветвей', uz: 'To‘rtala tarmoqning har birida islohot qabul qilish' },
    check: (ctx) => new Set(owned(ctx).map((r) => r.branch)).size >= 4,
  },
  {
    id: 'invisible-hand',
    name: { en: 'The Invisible Hand', ru: 'Невидимая рука', uz: 'Ko‘rinmas qo‘l' },
    condition: { en: 'Economy above 80', ru: 'Экономика выше 80', uz: 'Iqtisod 80 dan yuqori' },
    check: (ctx) => ctx.state.stats.economy > T.economyHigh,
  },
  {
    id: 'full-treasury',
    name: { en: 'Full Treasury', ru: 'Полная казна', uz: 'To‘la xazina' },
    condition: { en: 'Treasury at 90 or more', ru: 'Казна 90 и выше', uz: 'Xazina 90 va undan yuqori' },
    check: (ctx) => ctx.state.stats.treasury >= T.treasuryFull,
  },
  {
    id: 'peoples-favourite',
    name: { en: 'People’s Favourite', ru: 'Любимец народа', uz: 'Xalq sevimlisi' },
    condition: { en: 'Approval at 85 or more', ru: 'Одобрение 85 и выше', uz: 'Xalq ma’qullashi 85 va undan yuqori' },
    check: (ctx) => ctx.state.stats.approval >= T.approvalHigh,
  },
  {
    id: 'elites-content',
    name: { en: 'Contented Elites', ru: 'Элиты довольны', uz: 'Elitalar mamnun' },
    condition: { en: 'Elite loyalty at 90 or more', ru: 'Лояльность элит 90 и выше', uz: 'Elitalar sadoqati 90 va undan yuqori' },
    check: (ctx) => ctx.state.stats.eliteLoyalty >= T.eliteHigh,
  },
  {
    id: 'clean-hands',
    name: { en: 'Clean Hands', ru: 'Чистые руки', uz: 'Toza qo‘llar' },
    condition: { en: 'Corruption below 10', ru: 'Коррупция ниже 10', uz: 'Korrupsiya 10 dan past' },
    check: (ctx) => ctx.state.stats.corruption < T.corruptionClean,
  },
  {
    id: 'all-sorted',
    name: { en: 'All Sorted', ru: 'Всё схвачено', uz: 'Hammasi joyida' },
    condition: { en: 'Corruption above 80 — and still in power', ru: 'Коррупция выше 80 — и вы всё ещё у власти', uz: 'Korrupsiya 80 dan yuqori — va siz hali hokimiyatdasiz' },
    check: (ctx) => inPower(ctx) && ctx.state.stats.corruption > T.corruptionCaptured,
  },
  {
    id: 'calm-waters',
    name: { en: 'Calm Waters', ru: 'Тишь да гладь', uz: 'Tinchlik-osoyishtalik' },
    condition: { en: 'All seven stats safe at once (60+, corruption 40 or less)', ru: 'Все семь показателей в норме разом (от 60, коррупция до 40)', uz: 'Yettala ko‘rsatkich bir vaqtda me’yorda (60 dan, korrupsiya 40 gacha)' },
    check: (ctx) => {
      const s = ctx.state.stats;
      return (
        [s.economy, s.treasury, s.approval, s.eliteLoyalty, s.stability, s.development].every((v) => v >= T.calmStat) &&
        s.corruption <= T.calmCorruption
      );
    },
  },
  {
    id: 'democrat-to-the-bone',
    name: { en: 'Democrat to the Bone', ru: 'Демократ до мозга костей', uz: 'Suyak-suyagigacha demokrat' },
    condition: { en: 'Vector below 10', ru: 'Вектор ниже 10', uz: 'Vektor 10 dan past' },
    check: (ctx) => ctx.state.vector < T.vectorDemocrat,
  },
  {
    id: 'iron-fist',
    name: { en: 'Iron Fist', ru: 'Железная рука', uz: 'Temir qo‘l' },
    condition: { en: 'Vector above 90', ru: 'Вектор выше 90', uz: 'Vektor 90 dan yuqori' },
    check: (ctx) => ctx.state.vector > T.vectorIron,
  },
  {
    id: 'admin-resource',
    name: { en: 'Administrative Resource', ru: 'Админресурс', uz: 'Ma’muriy resurs' },
    condition: { en: 'Win an election in the authoritarian zone', ru: 'Выиграть выборы в авторитарной зоне', uz: 'Avtoritar zonada saylovda g‘alaba qozonish' },
    check: (ctx) => wonElectionIn(ctx, 'authoritarian'),
  },
  {
    id: 'ninety-nine-seven',
    name: { en: '99.7%', ru: '99,7%', uz: '99,7%' },
    condition: { en: 'Win an election in the totalitarian zone', ru: 'Выиграть выборы в тоталитарной зоне', uz: 'Totalitar zonada saylovda g‘alaba qozonish' },
    check: (ctx) => wonElectionIn(ctx, 'totalitarian'),
  },
  {
    id: 'crisis-manager',
    name: { en: 'Crisis Manager', ru: 'Кризисный менеджер', uz: 'Inqiroz menejeri' },
    condition: { en: 'Face 25 different events in one game', ru: 'Пережить 25 разных событий за одну игру', uz: 'Bir o‘yinda 25 ta turli voqeani boshdan kechirish' },
    check: (ctx) => Object.keys(ctx.state.eventHistory).length >= T.crisisEvents,
  },
  {
    id: 'experience-counts',
    name: { en: 'Experience Counts Too', ru: 'Опыт — тоже результат', uz: 'Tajriba ham natija' },
    condition: { en: 'Lose in any way', ru: 'Проиграть любым способом', uz: 'Istalgan yo‘l bilan yutqazish' },
    check: (ctx) => ctx.state.outcome?.result === 'defeat',
  },
  {
    id: 'disaster-collector',
    name: { en: 'Disaster Collector', ru: 'Коллекционер катастроф', uz: 'Falokatlar kolleksiyachisi' },
    condition: { en: 'Suffer all four defeats, across games', ru: 'Испытать все четыре поражения (в разных играх)', uz: 'To‘rtala mag‘lubiyatni boshdan kechirish (turli o‘yinlarda)' },
    check: (ctx) => new Set(ctx.defeatsSeen).size >= 4,
  },
];

/** Ids of medals whose check passes now but that aren't in `earned` yet, in MEDALS order.
 * Pure — the store decides what to persist. */
export function newlyEarned(earned: readonly string[], ctx: MedalContext, medals: readonly MedalDef[] = MEDALS): string[] {
  return medals.filter((m) => !earned.includes(m.id) && m.check(ctx)).map((m) => m.id);
}
