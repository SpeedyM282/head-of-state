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

export type ScriptedStepId =
  | 'welcome'
  | 'stats'
  | 'vector'
  | 'clock'
  | 'reformsOpen'
  | 'reformsBuy'
  | 'release';

export interface ScriptedStep {
  id: ScriptedStepId;
  anchor: TutorialAnchor;
  text: LocalizedText;
  /** Absent = advance via the "Дальше" button. Present = advance only by completing the
   * named action (opening the reforms panel / buying a reform) — the button is hidden. */
  advanceOn?: 'reformsOpen' | 'reformPurchased';
}

export const SCRIPTED_STEPS: ScriptedStep[] = [
  {
    id: 'welcome',
    anchor: null,
    text: {
      en: 'Congratulations on your election, Your Excellency! Your one job is to stay in power until the end of your term. Everything else will sort itself out, probably.',
      ru: 'Поздравляем с избранием, Ваше Превосходительство! Ваша единственная задача — продержаться у власти до конца срока. Остальное как-нибудь само.',
      uz: 'Saylanganingiz bilan tabriklaymiz, Janobi Oliylari! Yagona vazifangiz — muddat oxirigacha hokimiyatda qolish. Qolgani o‘z-o‘zidan hal bo‘lar.',
    },
  },
  {
    id: 'stats',
    anchor: 'stats-panel',
    text: {
      en: 'Here is the country in seven numbers. Everything works the usual way, except corruption — there, unfortunately, more is worse.',
      ru: 'Вот страна в семи числах. Всё как обычно, кроме коррупции — там, увы, чем больше, тем хуже.',
      uz: 'Mana, mamlakat yetti raqamda. Hammasi odatdagidek, faqat korrupsiyadan tashqari — u yerda, afsuski, ko‘p bo‘lsa, yomon.',
    },
  },
  {
    id: 'vector',
    anchor: 'vector-scale',
    text: {
      en: 'Your decisions push the country between democracy and totalitarianism. The zone changes the rules of the game — sometimes without you noticing, but never without the country noticing.',
      ru: 'Ваши решения двигают страну между демократией и тоталитаризмом. Зона меняет правила игры — иногда незаметно для вас, но не для страны.',
      uz: 'Sizning qarorlaringiz mamlakatni demokratiya va totalitarizm o‘rtasida siljitadi. Zona o‘yin qoidalarini o‘zgartiradi — ba’zan sezmay qolasiz, lekin mamlakat albatta sezadi.',
    },
  },
  {
    id: 'clock',
    anchor: 'clock-controls',
    text: {
      en: 'Time moves on its own — month after month, while you’re busy with matters of state. Pause, normal speed, or fast-forward — the choice is yours.',
      ru: 'Время идёт само — месяц за месяцем, пока вы отвлеклись на государственные дела. Пауза, обычный ход, ускорение — выбор за вами.',
      uz: 'Vaqt o‘z-o‘zidan o‘tadi — oy ortidan oy, siz davlat ishlariga andarmon bo‘lganingizda ham. Pauza, oddiy tezlik yoki tezlashtirish — tanlov sizniki.',
    },
  },
  {
    id: 'reformsOpen',
    anchor: 'reforms-button',
    text: {
      en: 'Take a look at Reforms — that’s where influence and treasury turn into change.',
      ru: 'Загляните в «Реформы» — там влияние и казна превращаются в перемены.',
      uz: '«Islohotlar»ga bir nazar tashlang — u yerda ta’sir va xazina o‘zgarishlarga aylanadi.',
    },
    advanceOn: 'reformsOpen',
  },
  {
    id: 'reformsBuy',
    anchor: ['reforms-tabs', 'reforms-first-node'],
    text: {
      en: 'Here are the branches: economy, security bloc, social policy, propaganda. Pick any affordable tier-one reform and approve it.',
      ru: 'Вот ветви: экономика, силовой блок, соцсфера, пропаганда. Выберите любую доступную реформу первого уровня и одобрите её.',
      uz: 'Mana tarmoqlar: iqtisodiyot, kuch tuzilmalari, ijtimoiy soha, targ‘ibot. Har qanday arzon birinchi darajali islohotni tanlang va uni qabul qiling.',
    },
    advanceOn: 'reformPurchased',
  },
  {
    id: 'release',
    anchor: null,
    text: {
      en: 'From here on, the country will let you know when something goes wrong. Good luck, Your Excellency — you’ll need it.',
      ru: 'Дальше страна сама подскажет, если что-то пойдёт не так. Удачи, Ваше Превосходительство — она вам понадобится.',
      uz: 'Bundan buyon biror narsa noto‘g‘ri ketsa, mamlakat o‘zi bildiradi. Omad tilaymiz, Janobi Oliylari — sizga kerak bo‘ladi.',
    },
  },
];

/** Context a tip predicate needs beyond the current GameState/GameContent — values that
 * only make sense relative to when tutorial JIT mode started (e.g. "changed since"), so they
 * cannot be derived from a single state snapshot alone. Tracked in tutorialStore, not core. */
export interface TipContext {
  initialZone: VectorZone;
}

export interface TutorialTip {
  id: string;
  anchor: TutorialAnchor;
  text: LocalizedText;
  /** Pure predicate over already-observable state — no new GameState fields, no side effects. */
  predicate: (state: GameState, content: GameContent, ctx: TipContext) => boolean;
}

const STAT_KEYS: StatKey[] = ['economy', 'treasury', 'approval', 'eliteLoyalty', 'stability', 'development', 'corruption'];

/** One-time, condition-triggered tips, checked in declaration order — adding a future tip
 * means adding an entry here, not touching any component. */
export const JIT_TIPS: TutorialTip[] = [
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
    anchor: 'vector-scale',
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
