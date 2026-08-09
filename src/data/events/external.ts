import type { GameEvent } from '../../core/types';

/**
 * External (world-reaction) events (12), once-only by default, balanced 4 per vector zone.
 * The world treats you differently depending on how you rule.
 */
export const externalEvents: GameEvent[] = [
  // ─── Democratic (4) ───
  {
    id: 'ext-investors-demo',
    kind: 'external',
    zones: ['democratic'],
    title: {
      en: 'Investment forum',
      ru: 'Инвестиционный форум',
      uz: 'Investitsiya forumi',
    },
    text: {
      en: 'Foreign investors are impressed by your reforms and want to invest.',
      ru: 'Иностранные инвесторы впечатлены вашими реформами и хотят вложиться.',
      uz: 'Chet ellik investorlar islohotlaringizdan taassurotlanib, sarmoya kiritmoqchi.',
    },
    options: [
      { text: { en: 'Open the doors', ru: 'Открыть двери', uz: 'Eshiklarni ochish' }, effects: [{ target: 'economy', delta: 8 }, { target: 'treasury', delta: 6 }] },
      { text: { en: 'Only with a local partner', ru: 'Только с местным партнёром', uz: 'Faqat mahalliy hamkor bilan' }, effects: [{ target: 'economy', delta: 4 }, { target: 'eliteLoyalty', delta: 5 }] },
    ],
  },
  {
    id: 'ext-cheap-credit',
    kind: 'external',
    zones: ['democratic'],
    title: {
      en: 'Concessional loan',
      ru: 'Льготный кредит',
      uz: 'Imtiyozli kredit',
    },
    text: {
      en: 'An international bank offers a loan at a laughable interest rate. Suspiciously laughable.',
      ru: 'Международный банк предлагает кредит под смешной процент. Даже подозрительно.',
      uz: 'Xalqaro bank kulgili foiz stavkasida kredit taklif qilmoqda. Hatto shubhali.',
    },
    options: [
      { text: { en: 'Take it for infrastructure', ru: 'Взять на инфраструктуру', uz: 'Infratuzilma uchun olish' }, effects: [{ target: 'treasury', delta: 10 }, { target: 'development', delta: 5 }] },
      { text: { en: 'Decline — sovereignty is worth more', ru: 'Отказаться — суверенитет дороже', uz: 'Rad etish — suverenitet qimmatroq' }, effects: [{ target: 'approval', delta: 3 }, { target: 'vector', delta: 3 }] },
    ],
  },
  {
    id: 'ext-tourism',
    kind: 'external',
    zones: ['democratic'],
    title: {
      en: 'Tourism boom',
      ru: 'Туристический бум',
      uz: 'Turizm bumi',
    },
    text: {
      en: 'Your country made the trendy travel lists. Foreigners come to see the “charming instability”.',
      ru: 'Ваша страна вошла в модные travel-списки. Иностранцы едут смотреть на «милую нестабильность».',
      uz: 'Mamlakatingiz zamonaviy sayohat ro‘yxatlariga kirdi. Chet elliklar «yoqimli beqarorlik»ni ko‘rgani kelishmoqda.',
    },
    options: [
      { text: { en: 'Build hotels', ru: 'Строить отели', uz: 'Mehmonxonalar qurish' }, effects: [{ target: 'treasury', delta: -5 }, { target: 'economy', delta: 7 }, { target: 'development', delta: 3 }] },
      { text: { en: 'Introduce a tourist tax', ru: 'Ввести туристический сбор', uz: 'Turistik yig‘im joriy etish' }, effects: [{ target: 'treasury', delta: 6 }, { target: 'approval', delta: -2 }] },
    ],
  },
  {
    id: 'ext-tech-hub',
    kind: 'external',
    zones: ['democratic'],
    title: {
      en: 'Tech hub',
      ru: 'Технологический хаб',
      uz: 'Texnologik markaz',
    },
    text: {
      en: 'A global tech giant wants to open an office here. It asks only for “a little internet freedom”.',
      ru: 'Мировой технологический гигант хочет открыть офис у вас. Просит только «немного свободы интернета».',
      uz: 'Jahon texnologik giganti bu yerda ofis ochmoqchi. U faqat «bir oz internet erkinligi»ni so‘raydi.',
    },
    options: [
      { text: { en: 'Agree', ru: 'Согласиться', uz: 'Rozi bo‘lish' }, effects: [{ target: 'development', delta: 8 }, { target: 'economy', delta: 4 }, { target: 'vector', delta: -4 }] },
      { text: { en: 'Set conditions', ru: 'Поставить условия', uz: 'Shartlar qo‘yish' }, effects: [{ target: 'development', delta: 3 }, { target: 'eliteLoyalty', delta: 3 }] },
    ],
  },

  // ─── Authoritarian (4) ───
  {
    id: 'ext-neighbors',
    kind: 'external',
    zones: ['authoritarian'],
    title: {
      en: 'Neighbors’ summit',
      ru: 'Саммит соседей',
      uz: 'Qo‘shnilar sammiti',
    },
    text: {
      en: 'The neighboring countries invite you to a summit. They promise a buffet and “a frank conversation”.',
      ru: 'Соседние страны зовут на саммит. Обещают фуршет и «откровенный разговор».',
      uz: 'Qo‘shni davlatlar sammitga chaqirmoqda. Furshet va «ochiq suhbat» va’da qilishmoqda.',
    },
    options: [
      { text: { en: 'Go and make a deal', ru: 'Поехать и договориться', uz: 'Borib kelishib olish' }, effects: [{ target: 'economy', delta: 5 }, { target: 'stability', delta: 3 }] },
      { text: { en: 'Send a body double', ru: 'Отправить двойника', uz: 'Dublyorni jo‘natish' }, effects: [{ target: 'stability', delta: -2 }, { target: 'approval', delta: 2 }] },
    ],
  },
  {
    id: 'ext-observer',
    kind: 'external',
    zones: ['authoritarian'],
    title: {
      en: 'International observers',
      ru: 'Международные наблюдатели',
      uz: 'Xalqaro kuzatuvchilar',
    },
    text: {
      en: 'The observers want to look at your elections. In advance. And preferably the voter lists too.',
      ru: 'Наблюдатели хотят посмотреть на ваши выборы. Заранее. И желательно списки избирателей.',
      uz: 'Kuzatuvchilar saylovlaringizni ko‘rmoqchi. Oldindan. Va imkoni bo‘lsa saylovchilar ro‘yxatini ham.',
    },
    options: [
      { text: { en: 'Let them in', ru: 'Пустить', uz: 'Kiritish' }, effects: [{ target: 'vector', delta: -5 }, { target: 'economy', delta: 3 }] },
      { text: { en: 'The visas have suddenly run out', ru: 'Визы внезапно закончились', uz: 'Vizalar to‘satdan tugab qoldi' }, effects: [{ target: 'vector', delta: 5 }, { target: 'economy', delta: -3 }] },
    ],
  },
  {
    id: 'ext-mediator',
    kind: 'external',
    zones: ['authoritarian'],
    title: {
      en: 'The mediator’s role',
      ru: 'Роль посредника',
      uz: 'Vositachi roli',
    },
    text: {
      en: 'Two neighbors quarreled and ask you to mediate. Both hint at gratitude.',
      ru: 'Два соседа поссорились и просят вас быть посредником. Оба намекают на благодарность.',
      uz: 'Ikki qo‘shni janjallashib, sizdan vositachi bo‘lishni so‘rashmoqda. Ikkalasi ham minnatdorchilikka ishora qilmoqda.',
    },
    options: [
      { text: { en: 'Reconcile them', ru: 'Помирить их', uz: 'Ularni yarashtirish' }, effects: [{ target: 'economy', delta: 5 }, { target: 'stability', delta: 3 }, { target: 'approval', delta: 2 }] },
      { text: { en: 'Sell weapons to both', ru: 'Продать оружие обоим', uz: 'Ikkalasiga ham qurol sotish' }, effects: [{ target: 'treasury', delta: 9 }, { target: 'approval', delta: -3 }, { target: 'vector', delta: 4 }] },
    ],
  },
  {
    id: 'ext-diaspora',
    kind: 'external',
    zones: ['authoritarian'],
    title: {
      en: 'Diaspora congress',
      ru: 'Съезд диаспоры',
      uz: 'Diaspora qurultoyi',
    },
    text: {
      en: 'Emigrants offer investment. In return they want to be “finally heard”.',
      ru: 'Уехавшие соотечественники предлагают инвестиции. Взамен хотят, чтобы их «наконец услышали».',
      uz: 'Chet elga ketgan vatandoshlar sarmoya taklif qilmoqda. Evaziga «nihoyat eshitilishni» xohlashadi.',
    },
    options: [
      { text: { en: 'Give them a platform', ru: 'Дать им трибуну', uz: 'Ularga minbar berish' }, effects: [{ target: 'treasury', delta: 6 }, { target: 'approval', delta: 3 }, { target: 'vector', delta: -4 }] },
      { text: { en: 'Take the money, forget the promises', ru: 'Взять деньги, забыть обещания', uz: 'Pulni olib, va’dalarni unutish' }, effects: [{ target: 'treasury', delta: 8 }, { target: 'approval', delta: -4 }, { target: 'eliteLoyalty', delta: 2 }] },
    ],
  },

  // ─── Totalitarian (4) ───
  {
    id: 'ext-sanctions',
    kind: 'external',
    zones: ['totalitarian'],
    cooldown: 5,
    title: {
      en: 'Sanctions',
      ru: 'Санкции',
      uz: 'Sanksiyalar',
    },
    text: {
      en: 'The world community expressed “deep concern” and froze your accounts. The concern is indeed deep.',
      ru: 'Мировое сообщество выразило «глубокую озабоченность» и заморозило ваши счета. Озабоченность действительно глубокая.',
      uz: 'Jahon hamjamiyati «chuqur tashvish» bildirdi va hisoblaringizni muzlatdi. Tashvish haqiqatan ham chuqur.',
    },
    options: [
      { text: { en: 'Import substitution', ru: 'Импортозамещение', uz: 'Import o‘rnini bosish' }, effects: [{ target: 'economy', delta: -6 }, { target: 'development', delta: 3 }, { target: 'approval', delta: 2 }] },
      { text: { en: 'Befriend the other outcasts', ru: 'Дружить с другими изгоями', uz: 'Boshqa quvg‘indilar bilan do‘stlashish' }, effects: [{ target: 'economy', delta: -3 }, { target: 'vector', delta: 5 }] },
    ],
  },
  {
    id: 'ext-isolation',
    kind: 'external',
    zones: ['totalitarian'],
    cooldown: 5,
    title: {
      en: 'International isolation',
      ru: 'Международная изоляция',
      uz: 'Xalqaro yakkalanish',
    },
    text: {
      en: 'Your country was expelled from yet another organization. Which one exactly is now hard to recall.',
      ru: 'Вашу страну исключили из очередной организации. Из какой именно — уже сложно вспомнить.',
      uz: 'Mamlakatingiz navbatdagi tashkilotdan chiqarildi. Aynan qaysi biridan — endi eslash qiyin.',
    },
    options: [
      { text: { en: 'Found your own organization', ru: 'Создать свою организацию', uz: 'O‘z tashkilotingizni tuzish' }, effects: [{ target: 'treasury', delta: -6 }, { target: 'approval', delta: 4 }] },
      { text: { en: 'Maintain a proud silence', ru: 'Гордо промолчать', uz: 'G‘urur bilan jim turish' }, effects: [{ target: 'economy', delta: -4 }, { target: 'stability', delta: 2 }] },
    ],
  },
  {
    id: 'ext-parade',
    kind: 'external',
    zones: ['totalitarian'],
    title: {
      en: 'The grand parade',
      ru: 'Большой парад',
      uz: 'Katta parad',
    },
    text: {
      en: 'A friendly regime invites you to a military parade. Missiles, flags and mandatory applause.',
      ru: 'Дружественный режим зовёт на военный парад. Ракеты, флаги и обязательные аплодисменты.',
      uz: 'Do‘st rejim harbiy paradga chaqirmoqda. Raketalar, bayroqlar va majburiy qarsaklar.',
    },
    options: [
      { text: { en: 'Go and show your missiles', ru: 'Поехать и показать ракеты', uz: 'Borib raketalaringizni ko‘rsatish' }, effects: [{ target: 'eliteLoyalty', delta: 5 }, { target: 'treasury', delta: -5 }, { target: 'vector', delta: 4 }] },
      { text: { en: 'Send a congratulatory telegram', ru: 'Прислать поздравительную телеграмму', uz: 'Tabrik telegrammasi yuborish' }, effects: [{ target: 'stability', delta: 2 }, { target: 'eliteLoyalty', delta: -2 }] },
    ],
  },
  {
    id: 'ext-defector',
    kind: 'external',
    zones: ['totalitarian'],
    title: {
      en: 'The defector',
      ru: 'Побег дипломата',
      uz: 'Diplomatning qochishi',
    },
    text: {
      en: 'Your ambassador sought asylum abroad and gave an interview. A long one. With details.',
      ru: 'Ваш посол попросил убежища за границей и дал интервью. Длинное. С подробностями.',
      uz: 'Elchingiz chet elda boshpana so‘radi va intervyu berdi. Uzun. Tafsilotlar bilan.',
    },
    options: [
      { text: { en: 'Declare him insane', ru: 'Объявить его сумасшедшим', uz: 'Uni aqldan ozgan deb e’lon qilish' }, effects: [{ target: 'approval', delta: -3 }, { target: 'stability', delta: 2 }, { target: 'vector', delta: 5 }] },
      { text: { en: 'Strip citizenship and stay silent', ru: 'Лишить гражданства и молчать', uz: 'Fuqarolikdan mahrum qilib, jim turish' }, effects: [{ target: 'approval', delta: -2 }, { target: 'economy', delta: -3 }] },
    ],
  },
];
