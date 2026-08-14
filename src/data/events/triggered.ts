import type { GameEvent } from '../../core/types';

/**
 * Triggered events (12). Repeatable pressure/opportunity mechanics — they fire whenever
 * their predicate holds and re-fire after `cooldown` turns (not once-only). Six watch a
 * stat crossing into danger on the low side; two watch the high side (surplus treasury,
 * runaway approval); one is a scripted term-2 constitutional beat; two are election-cycle
 * mechanics (per-term run/step-down choice, and its sanctions aftermath); one watches
 * runaway corruption.
 */
export const triggeredEvents: GameEvent[] = [
  {
    id: 'trg-election-choice',
    kind: 'triggered',
    // Fires in the 3-month window before every election, every term — including after a
    // constitution amendment (elections keep happening, just without a term cap). Placed
    // first for priority so it reliably wins the slot even if another triggered event's
    // predicate is also true that month. Suppressed once stepDownPending is already set
    // (e.g. the term-2 constitutional refusal already decided this term's outcome — see
    // trg-constitution below — so there is nothing left to ask).
    trigger: (s, content) => {
      if (s.stepDownPending) return false;
      const electionTurn = s.term * content.difficulty.turnsToWin;
      return s.turn >= electionTurn - 3 && s.turn < electionTurn;
    },
    cooldown: 10, // wider than the 3-month window, narrower than a term — refires next term
    title: {
      en: 'Elections are looming',
      ru: 'Выборы на носу',
      uz: 'Saylovlar yaqinlashmoqda',
    },
    text: {
      en: 'In three months the country votes on your fate again. The campaign office wants an answer: print new posters, or start drafting a farewell speech?',
      ru: 'Через три месяца страна снова проголосует за вашу судьбу. Штаб ждёт ответа: печатать новые плакаты или уже готовить прощальную речь?',
      uz: 'Uch oydan so‘ng mamlakat yana taqdiringiz uchun ovoz beradi. Shtab javob kutmoqda: yangi plakatlar bosilsinmi yoki xayrlashuv nutqi tayyorlansinmi?',
    },
    options: [
      {
        text: { en: 'Run for another term', ru: 'Баллотироваться на новый срок', uz: 'Yana bir muddatga nomzod bo‘lish' },
        effects: [{ target: 'influence', delta: 2 }, { target: 'stability', delta: -1 }],
      },
      {
        text: { en: 'Step down at your peak', ru: 'Уйти на пике популярности', uz: 'Mashhurlik cho‘qqisida ketish' },
        effects: [{ target: 'approval', delta: 5 }],
        flags: { stepDown: true },
      },
    ],
  },
  {
    id: 'trg-protests',
    kind: 'triggered',
    trigger: (s) => s.stats.approval < 30,
    cooldown: 4,
    title: {
      en: 'Mass protests',
      ru: 'Массовые протесты',
      uz: 'Ommaviy noroziliklar',
    },
    text: {
      en: 'The square is full of people. The slogans are mostly about you, and mostly unprintable.',
      ru: 'Площадь заполнена людьми. Лозунги в основном про вас, и в основном нецензурные.',
      uz: 'Maydon odamlar bilan to‘la. Shiorlar asosan siz haqingizda va asosan so‘kinishli.',
    },
    options: [
      { text: { en: 'Go out to the people', ru: 'Выйти к людям', uz: 'Xalq oldiga chiqish' }, effects: [{ target: 'approval', delta: 8 }, { target: 'eliteLoyalty', delta: -4 }, { target: 'vector', delta: -6 }] },
      { text: { en: 'Disperse them', ru: 'Разогнать', uz: 'Tarqatib yuborish' }, effects: [{ target: 'approval', delta: -8 }, { target: 'stability', delta: 6 }, { target: 'vector', delta: 10 }] },
      { text: { en: 'Promise reforms', ru: 'Пообещать реформы', uz: 'Islohotlar va’da qilish' }, effects: [{ target: 'approval', delta: 4 }, { target: 'stability', delta: -3 }] },
    ],
  },
  {
    id: 'trg-creditors',
    kind: 'triggered',
    trigger: (s) => s.stats.treasury < 10,
    cooldown: 4,
    title: {
      en: 'The creditors are calling',
      ru: 'Кредиторы звонят',
      uz: 'Kreditorlar qo‘ng‘iroq qilmoqda',
    },
    text: {
      en: 'The international fund reminds you about the debt. Politely. Politely for now.',
      ru: 'Международный фонд напоминает о долге. Вежливо. Пока вежливо.',
      uz: 'Xalqaro fond qarz haqida eslatmoqda. Xushmuomalalik bilan. Hozircha xushmuomalalik bilan.',
    },
    options: [
      { text: { en: 'Take out a new loan', ru: 'Взять новый кредит', uz: 'Yangi kredit olish' }, effects: [{ target: 'treasury', delta: 15 }, { target: 'economy', delta: -4 }, { target: 'vector', delta: -3 }] },
      { text: { en: 'Raise taxes', ru: 'Поднять налоги', uz: 'Soliqlarni oshirish' }, effects: [{ target: 'treasury', delta: 10 }, { target: 'approval', delta: -7 }] },
      { text: { en: 'Sell state assets to the elites', ru: 'Продать госактивы элитам', uz: 'Davlat aktivlarini elitalarga sotish' }, effects: [{ target: 'treasury', delta: 12 }, { target: 'eliteLoyalty', delta: 6 }, { target: 'development', delta: -5 }] },
    ],
  },
  {
    id: 'trg-generals',
    kind: 'triggered',
    trigger: (s) => s.stats.eliteLoyalty < 30,
    cooldown: 4,
    title: {
      en: 'The generals are whispering',
      ru: 'Генералы шепчутся',
      uz: 'Generallar pichirlashmoqda',
    },
    text: {
      en: 'Intelligence reports: the generals have taken to dining together often. The menu is unknown; so are the topics of conversation.',
      ru: 'Разведка докладывает: генералы стали часто ужинать вместе. Меню неизвестно, темы разговоров — тоже.',
      uz: 'Razvedka ma’lum qilmoqda: generallar tez-tez birga kechki ovqatlanadigan bo‘lishdi. Menyu noma’lum, suhbat mavzulari ham.',
    },
    options: [
      { text: { en: 'Raise everyone’s salary', ru: 'Повысить всем оклады', uz: 'Hammaga maosh oshirish' }, effects: [{ target: 'eliteLoyalty', delta: 10 }, { target: 'treasury', delta: -10 }] },
      { text: { en: 'Send the most active ones “to study”', ru: 'Отправить самых активных «на учёбу»', uz: 'Eng faollarini «o‘qishga» jo‘natish' }, effects: [{ target: 'eliteLoyalty', delta: 5 }, { target: 'stability', delta: -3 }, { target: 'vector', delta: 6 }] },
      { text: { en: 'Show up to dinner in person', ru: 'Прийти на ужин лично', uz: 'Kechki ovqatga shaxsan borish' }, effects: [{ target: 'eliteLoyalty', delta: 6 }, { target: 'approval', delta: -2 }] },
    ],
  },
  {
    id: 'trg-strike',
    kind: 'triggered',
    trigger: (s) => s.stats.economy < 30,
    cooldown: 5,
    title: {
      en: 'Strike',
      ru: 'Забастовка',
      uz: 'Ish tashlash',
    },
    text: {
      en: 'The factories have stopped. The workers demand their wages — in money, not in certificates.',
      ru: 'Заводы встали. Рабочие требуют зарплату — деньгами, а не грамотами.',
      uz: 'Zavodlar to‘xtadi. Ishchilar maoshni talab qilmoqda — pulda, faxriy yorliqlarda emas.',
    },
    options: [
      { text: { en: 'Pay from the treasury', ru: 'Выплатить из казны', uz: 'Xazinadan to‘lash' }, effects: [{ target: 'treasury', delta: -8 }, { target: 'approval', delta: 5 }, { target: 'economy', delta: 3 }] },
      { text: { en: 'Award them higher-quality certificates', ru: 'Наградить грамотами повышенного качества', uz: 'Yuqori sifatli yorliqlar bilan taqdirlash' }, effects: [{ target: 'approval', delta: -6 }, { target: 'economy', delta: -3 }] },
    ],
  },
  {
    id: 'trg-instability',
    kind: 'triggered',
    trigger: (s) => s.stats.stability < 25,
    cooldown: 5,
    title: {
      en: 'Chaos in the regions',
      ru: 'Хаос в регионах',
      uz: 'Hududlardagi tartibsizlik',
    },
    text: {
      en: 'The governors have stopped answering the phone. One sent a postcard from abroad.',
      ru: 'Губернаторы перестали брать трубку. Один прислал открытку из-за границы.',
      uz: 'Gubernatorlar telefonni ko‘tarmaydigan bo‘lishdi. Biri chet eldan otkritka yubordi.',
    },
    options: [
      { text: { en: 'Appoint new ones', ru: 'Назначить новых', uz: 'Yangilarini tayinlash' }, effects: [{ target: 'stability', delta: 8 }, { target: 'eliteLoyalty', delta: -4 }, { target: 'vector', delta: 4 }] },
      { text: { en: 'Grant the regions autonomy', ru: 'Дать регионам автономию', uz: 'Hududlarga muxtoriyat berish' }, effects: [{ target: 'stability', delta: 4 }, { target: 'approval', delta: 4 }, { target: 'vector', delta: -6 }] },
    ],
  },
  {
    id: 'trg-braindrain',
    kind: 'triggered',
    trigger: (s) => s.stats.development < 25,
    cooldown: 5,
    title: {
      en: 'Brain drain',
      ru: 'Утечка мозгов',
      uz: 'Miya oqimi',
    },
    text: {
      en: 'The country’s last programmer posted a photo from the airport. Caption: “Well, that’s it”.',
      ru: 'Последний программист страны выложил фото из аэропорта. Подпись: «Ну всё».',
      uz: 'Mamlakatning oxirgi dasturchisi aeroportdan surat joyladi. Izoh: «Xo‘sh, tamom».',
    },
    options: [
      { text: { en: 'A program to bring talent back', ru: 'Программа возвращения талантов', uz: 'Iste’dodlarni qaytarish dasturi' }, effects: [{ target: 'treasury', delta: -8 }, { target: 'development', delta: 7 }] },
      { text: { en: 'We will manage without them', ru: 'Обойдёмся', uz: 'Ularsiz ham eplaymiz' }, effects: [{ target: 'development', delta: -3 }, { target: 'economy', delta: -2 }] },
    ],
  },

  // ─── New (2): high-side triggers ───
  {
    id: 'trg-surplus',
    kind: 'triggered',
    trigger: (s) => s.stats.treasury > 80,
    cooldown: 6,
    title: {
      en: 'Budget surplus',
      ru: 'Профицит бюджета',
      uz: 'Byudjet profitsiti',
    },
    text: {
      en: 'The treasury is overflowing. The ministers eye it hungrily; so do the people.',
      ru: 'Казна переполнена. Министры смотрят на неё голодными глазами, народ — тоже.',
      uz: 'Xazina to‘lib-toshgan. Vazirlar unga och ko‘z bilan qaraydi; xalq ham.',
    },
    options: [
      { text: { en: 'Hand it to the people', ru: 'Раздать народу', uz: 'Xalqqa tarqatish' }, effects: [{ target: 'approval', delta: 8 }, { target: 'treasury', delta: -12 }, { target: 'vector', delta: -3 }] },
      { text: { en: 'Invest in development', ru: 'Вложить в развитие', uz: 'Rivojlanishga sarmoya' }, effects: [{ target: 'development', delta: 8 }, { target: 'treasury', delta: -10 }] },
      { text: { en: 'Hand it to the elites', ru: 'Раздать элитам', uz: 'Elitalarga tarqatish' }, effects: [{ target: 'eliteLoyalty', delta: 9 }, { target: 'treasury', delta: -12 }, { target: 'approval', delta: -3 }, { target: 'vector', delta: 3 }] },
    ],
  },
  {
    id: 'trg-dizzy-success',
    kind: 'triggered',
    once: true,
    trigger: (s) => s.stats.approval > 75,
    title: {
      en: 'Dizzy with success',
      ru: 'Головокружение от успехов',
      uz: 'Muvaffaqiyatdan boshi aylandi',
    },
    text: {
      en: 'Approval is off the charts. Advisers whisper that with such love, elections are a mere formality.',
      ru: 'Рейтинг зашкаливает. Советники шепчут, что при такой любви народа выборы — пустая формальность.',
      uz: 'Reyting o‘ta yuqori. Maslahatchilar pichirlaydi: bunday sevgi bilan saylov — quruq rasmiyatchilik.',
    },
    options: [
      // (a) A cheap boost now, but complacency curdles into a ratings slump half a year on.
      {
        text: { en: 'Believe the advisers', ru: 'Поверить советникам', uz: 'Maslahatchilarga ishonish' },
        effects: [{ target: 'influence', delta: 3 }],
        delayedEffects: [{ afterTurns: 6, effects: [{ target: 'approval', delta: -10 }] }],
      },
      { text: { en: 'Check the rating in person', ru: '«Проверить рейтинг лично»', uz: 'Reytingni shaxsan tekshirish' }, effects: [{ target: 'treasury', delta: -5 }, { target: 'approval', delta: 3 }, { target: 'vector', delta: -3 }] },
      { text: { en: 'Cancel the debates', ru: 'Отменить дебаты', uz: 'Debatlarni bekor qilish' }, effects: [{ target: 'vector', delta: 6 }, { target: 'stability', delta: 2 }, { target: 'approval', delta: -4 }] },
    ],
  },
  {
    id: 'trg-constitution',
    kind: 'triggered',
    once: true,
    // Six months before the term-limit election (month 90 of the 96-month second term) —
    // three months ahead of trg-election-choice's window (93-95), so it always resolves first.
    // A refusal sets stepDownPending, which then suppresses trg-election-choice for this term.
    trigger: (s) => s.term === 2 && !s.constitutionAmended && s.turn >= 90,
    title: {
      en: 'The constitutional question',
      ru: 'Конституционный вопрос',
      uz: 'Konstitutsiyaviy masala',
    },
    text: {
      en: 'Your second term is ending, and the constitution allows only two. The lawyers have already brought a draft amendment — just in case.',
      ru: 'Второй срок подходит к концу, а конституция позволяет только два. Юристы уже принесли проект поправок — на всякий случай.',
      uz: 'Ikkinchi muddatingiz tugayapti, konstitutsiya esa faqat ikkitasiga ruxsat beradi. Yuristlar har ehtimolga qarshi tuzatma loyihasini olib kelishdi.',
    },
    options: [
      {
        text: { en: 'Amend the constitution', ru: 'Изменить конституцию', uz: 'Konstitutsiyani o‘zgartirish' },
        effects: [{ target: 'vector', delta: 15 }, { target: 'eliteLoyalty', delta: 10 }, { target: 'approval', delta: -8 }],
        flags: { amendConstitution: true },
      },
      {
        text: { en: 'Refuse and step down after the term', ru: 'Отказаться и уйти после срока', uz: 'Rad etib, muddatdan so‘ng ketish' },
        effects: [{ target: 'approval', delta: 5 }, { target: 'stability', delta: 3 }],
        flags: { stepDown: true },
      },
    ],
  },
  {
    id: 'trg-amendments-sanctions',
    kind: 'triggered',
    once: true,
    trigger: (s) => s.constitutionAmended,
    title: {
      en: 'The world reacts to the amendments',
      ru: 'Реакция на поправки',
      uz: 'Dunyoning tuzatmalarga munosabati',
    },
    text: {
      en: 'The world community studied your constitutional amendments closely and suddenly remembered about sanctions. The wording is copied from last time.',
      ru: 'Мировое сообщество внимательно изучило ваши поправки к конституции и внезапно вспомнило про санкции. Формулировки — как под копирку с прошлого раза.',
      uz: 'Jahon hamjamiyati konstitutsiyaviy tuzatmalaringizni diqqat bilan o‘rgandi va to‘satdan sanksiyalarni esladi. Ifodalar o‘tgan safargidek nusxa.',
    },
    options: [
      { text: { en: 'Proudly ignore them', ru: 'Гордо проигнорировать', uz: 'G‘urur bilan e’tiborsiz qoldirish' }, effects: [{ target: 'economy', delta: -5 }, { target: 'vector', delta: 4 }, { target: 'stability', delta: 2 }] },
      { text: { en: 'Make concessions', ru: 'Пойти на уступки', uz: 'Yon berish' }, effects: [{ target: 'approval', delta: 3 }, { target: 'eliteLoyalty', delta: -4 }, { target: 'vector', delta: -3 }] },
    ],
  },
  {
    id: 'trg-corruption-crisis',
    kind: 'triggered',
    trigger: (s) => s.stats.corruption > 70,
    cooldown: 5,
    title: {
      en: 'Corruption off the charts',
      ru: 'Коррупция зашкаливает',
      uz: 'Korrupsiya chegaradan chiqdi',
    },
    text: {
      en: 'The international corruption-perception index ranked your country alongside states that barely exist on the map. Investors are asking if this is a joke.',
      ru: 'Международный индекс восприятия коррупции поставил вашу страну в один ряд со странами, которых как бы не существует. Инвесторы уточняют, шутка ли это.',
      uz: 'Xalqaro korrupsiya idroki indeksi mamlakatingizni deyarli mavjud bo‘lmagan davlatlar qatoriga qo‘ydi. Investorlar bu hazilmi, deb so‘ramoqda.',
    },
    options: [
      { text: { en: 'A loud purge', ru: 'Громкая чистка рядов', uz: 'Baland ovozli tozalash' }, effects: [{ target: 'corruption', delta: -15 }, { target: 'eliteLoyalty', delta: -12 }, { target: 'stability', delta: -4 }, { target: 'vector', delta: 6 }] },
      { text: { en: 'A pretty report for investors', ru: 'Красивый отчёт для инвесторов', uz: 'Investorlar uchun chiroyli hisobot' }, effects: [{ target: 'corruption', delta: 5 }, { target: 'economy', delta: 3 }, { target: 'approval', delta: -3 }] },
      { text: { en: 'Change nothing — at least it’s stable', ru: 'Ничего не менять, зато стабильно', uz: 'Hech narsani o‘zgartirmaslik — hech bo‘lmasa barqaror' }, effects: [{ target: 'stability', delta: 2 }, { target: 'corruption', delta: 3 }, { target: 'development', delta: -2 }] },
    ],
  },
];
