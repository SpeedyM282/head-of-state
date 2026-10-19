import type { GameContent, GameState, LocalizedText, StatKey, VectorZone } from '../../core';
import { electionTurn, vectorZone } from '../../core';
import { isDangerous } from '../../data/statMeta';

/**
 * Declarative tutorial content — the advisor's voice ("Советник"), written in the game's own
 * dry, bureaucratic-satire tone (see data/events/*.ts). Presentation-only: nothing here reads
 * from or writes to core/, and every predicate is a pure function over already-observable
 * store state (GameState + GameContent), never a new field bolted onto GameState.
 */

/** DOM anchor id(s) a step/tip spotlights (see ui/tutorial/Spotlight.tsx's data-tutorial
 * lookup). `null` means no specific target — the advisor speaks from center screen. An array
 * spotlights the union of all matched elements (e.g. the reform tabs AND the reform card). */
export type TutorialAnchor = string | string[] | null;

export type ScriptedStepId = 'stats' | 'map' | 'term' | 'defeats';

export interface ScriptedStep {
  id: ScriptedStepId;
  anchor: TutorialAnchor;
  /** Coach card heading (Spectral). */
  title: LocalizedText;
  text: LocalizedText;
}

/** The «Кабинет» opening (handoff screen 12): four coach-card steps over the main screen, each
 * advanced by «Дальше» («Начать игру» on the last). The vector is explained separately, on the
 * first visit to Реформы (the 'reforms-vector' tip below). */
export const SCRIPTED_STEPS: ScriptedStep[] = [
  {
    id: 'stats',
    anchor: 'stats-panel',
    title: { en: 'The country’s indicators', ru: 'Показатели страны', uz: 'Mamlakat ko‘rsatkichlari' },
    text: {
      en: 'Seven numbers, from the economy to corruption. Keep them in balance: failing any one leads to a crisis, and success — to suspicion.',
      ru: 'Семь чисел, от экономики до коррупции. Держите их в равновесии: провал любого ведёт к кризису, а успех — к подозрениям.',
      uz: 'Iqtisoddan korrupsiyagacha yetti raqam. Ularni muvozanatda saqlang: birortasining barbod bo‘lishi inqirozga, muvaffaqiyat esa — shubhalarga olib keladi.',
    },
  },
  {
    id: 'map',
    anchor: 'map-focus',
    title: { en: 'The map and dispatches', ru: 'Карта и донесения', uz: 'Xarita va xabarnomalar' },
    text: {
      en: 'This is your country. Red dots are dispatches — events awaiting your decision. Time stops while you read them.',
      ru: 'Это ваша страна. Красные точки — донесения: события, которые ждут вашего решения. Пока вы читаете, время стоит.',
      uz: 'Bu sizning mamlakatingiz. Qizil nuqtalar — xabarnomalar: qaroringizni kutayotgan voqealar. Siz o‘qiyotganingizda vaqt to‘xtaydi.',
    },
  },
  {
    id: 'term',
    anchor: 'main-header',
    title: { en: 'Term and elections', ru: 'Срок и выборы', uz: 'Muddat va saylov' },
    text: {
      en: 'Up top: the month of your term, time until the election and influence. An election comes every 48 months. Influence accrues by itself — spend it on reforms, the button is at the bottom.',
      ru: 'Сверху — месяц срока, сколько до выборов и очки влияния. Выборы — каждые 48 месяцев. Влияние копится само; тратьте его на реформы, кнопка внизу.',
      uz: 'Yuqorida — muddat oyi, saylovgacha qolgan vaqt va ta’sir. Saylov har 48 oyda bo‘ladi. Ta’sir o‘zi to‘planadi — uni islohotlarga sarflang, tugma pastda.',
    },
  },
  {
    id: 'defeats',
    anchor: null,
    title: { en: 'How to lose', ru: 'Как проиграть', uz: 'Qanday yutqazish mumkin' },
    text: {
      en: 'Four ways: a coup (the elites), a revolution (the people and stability), a default (an empty treasury) and a lost election. Stepping down on your own is a victory.',
      ru: 'Четыре способа: переворот (элиты), революция (народ и стабильность), дефолт (пустая казна) и проигранные выборы. Уйти самому — тоже победа.',
      uz: 'To‘rt yo‘l: to‘ntarish (elitalar), inqilob (xalq va barqarorlik), defolt (bo‘sh xazina) va yutqazilgan saylov. O‘z ixtiyori bilan ketish — g‘alaba.',
    },
  },
];

/** Context a tip predicate needs beyond the current GameState/GameContent — values that
 * only make sense relative to when tutorial JIT mode started (e.g. "changed since"), or that
 * live in the UI rather than the game (is the reforms screen open). Tracked in
 * tutorialStore/gameStore, not core. */
export interface TipContext {
  initialZone: VectorZone;
  reformsOpen: boolean;
}

/** Which screen a tip belongs to: 'main' tips only show on the map screen (their anchors live
 * there), 'reforms' tips only while Реформы is open, 'any' on either. */
export type TipScreen = 'main' | 'reforms' | 'any';

export interface TutorialTip {
  id: string;
  anchor: TutorialAnchor;
  /** Defaults to 'main'. */
  screen?: TipScreen;
  text: LocalizedText;
  /** Pure predicate over already-observable state — no new GameState fields, no side effects. */
  predicate: (state: GameState, content: GameContent, ctx: TipContext) => boolean;
}

const STAT_KEYS: StatKey[] = ['economy', 'treasury', 'approval', 'eliteLoyalty', 'stability', 'development', 'corruption'];

/** One-time, condition-triggered tips, checked in declaration order — adding a future tip
 * means adding an entry here, not touching any component. */
export const JIT_TIPS: TutorialTip[] = [
  {
    id: 'reforms-vector',
    anchor: 'vector-panel',
    screen: 'reforms',
    text: {
      en: 'At the bottom is the governance vector: your decisions move the country between democracy and totalitarianism, and the zone changes the rules. “If adopted” shows where the selected reform would push it.',
      ru: 'Внизу — вектор правления: ваши решения двигают страну между демократией и тоталитаризмом, а зона меняет правила игры. «Если принять» показывает, куда сдвинет выбранная реформа.',
      uz: 'Pastda — boshqaruv vektori: qarorlaringiz mamlakatni demokratiya va totalitarizm o‘rtasida siljitadi, zona esa qoidalarni o‘zgartiradi. «Qabul qilinsa» tanlangan islohot uni qayerga surishini ko‘rsatadi.',
    },
    predicate: (_state, _content, ctx) => ctx.reformsOpen,
  },
  {
    id: 'danger-zone',
    anchor: 'stats-panel',
    text: {
      en: 'Red means alarm, not a verdict. You have a few months to fix the number before it costs you your power.',
      ru: 'Красный цвет — тревога, не приговор. У вас есть несколько месяцев, чтобы выправить показатель, прежде чем это будет стоить вам власти.',
      uz: 'Qizil rang — xavf, hukm emas. Ko‘rsatkichni tuzatish uchun sizda hokimiyatingizga zarar yetkazguncha bir necha oy vaqt bor.',
    },
    predicate: (state, content) => {
      const threshold = content.difficulty.defeatThreshold + 10;
      return STAT_KEYS.some((k) => isDangerous(k, state.stats[k], threshold));
    },
  },
  {
    id: 'vector-zone-change',
    // Points at the vector panel while Реформы is open; on the main screen (no vector there)
    // the card simply centers.
    anchor: 'vector-panel',
    screen: 'any',
    text: {
      en: 'The governance zone has changed. The rules of the game are different now — keep a closer eye on the vector.',
      ru: 'Зона правления сменилась. Правила игры теперь другие — присмотритесь к вектору повнимательнее.',
      uz: 'Boshqaruv zonasi o‘zgardi. Endi o‘yin qoidalari boshqacha — vektorni diqqat bilan kuzatib boring.',
    },
    predicate: (state, _content, ctx) => vectorZone(state.vector) !== ctx.initialZone,
  },
  {
    id: 'corruption-50',
    anchor: 'stats-panel',
    text: {
      en: 'Corruption has crossed the halfway mark. It’s eating the treasury — but conveniently, the elites rather like it.',
      ru: 'Коррупция перевалила за половину. Она подъедает казну — но, что удобно, элитам это даже нравится.',
      uz: 'Korrupsiya yarmidan oshdi. U xazinani yeb qo‘yadi — ammo qulay tomoni, elitaga bu yoqadi.',
    },
    predicate: (state, content) => state.stats.corruption > content.balance.corruptionEliteBondThreshold,
  },
  {
    id: 'election-approaching',
    anchor: null,
    text: {
      en: 'The first election is only months away. The outcome depends on your governance zone: public approval, an elite safety margin, or a plain formality.',
      ru: 'До первых выборов — считаные месяцы. Итог решит зона правления: одобрение народа, запас прочности элит или простая формальность.',
      uz: 'Birinchi saylovga sanoqli oy qoldi. Natijani boshqaruv zonasi hal qiladi: xalq ma’qullashi, elitaning zaxira marjasi yoki oddiy rasmiyat.',
    },
    predicate: (state, content) => {
      if (state.term !== 1) return false;
      const remaining = electionTurn(state, content) - state.turn;
      return remaining > 0 && remaining <= 6;
    },
  },
  {
    id: 'elite-unpaid',
    anchor: 'stats-panel',
    text: {
      en: 'The treasury is empty enough that there’s nothing left to pay the elites. They won’t stick with you for free.',
      ru: 'Казна опустела настолько, что элитам нечем платить. Даром они за вас держаться не станут.',
      uz: 'Xazina shu qadar bo‘shadiki, elitaga to‘lashga hech narsa qolmadi. Ular siz uchun tekinga ishlamaydi.',
    },
    predicate: (state, content) => state.stats.treasury < content.balance.eliteUnpaidTreasuryThreshold,
  },
  {
    id: 'first-event',
    anchor: null,
    text: {
      en: 'An urgent dispatch. Time stops while you read. The cost is listed under each option — every choice is a trade-off.',
      ru: 'Срочное донесение. Время останавливается, пока вы читаете. Под каждым вариантом — его цена: любой выбор — это компромисс.',
      uz: 'Shoshilinch ma’lumot. Siz o‘qiyotganingizda vaqt to‘xtaydi. Har bir variant ostida uning narxi ko‘rsatilgan — har qanday tanlov — bu murosa.',
    },
    // Intentionally NOT gated to the constitution event or any other single dramatic beat —
    // this fires on whichever event happens to be the first one drawn, which is the point:
    // it teaches the event *mechanic*, not any specific event's content.
    predicate: (state) => state.pendingEventId !== null,
  },
];
