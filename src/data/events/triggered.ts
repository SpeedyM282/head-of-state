import type { GameEvent } from '../../core/types';

/**
 * Triggered events (8). Repeatable pressure/opportunity mechanics — they fire whenever
 * their predicate holds and re-fire after `cooldown` turns (not once-only). Six watch a
 * stat crossing into danger on the low side; the two newest watch the high side
 * (surplus treasury, runaway approval) — conditions the low-watch triggers never saw.
 */
export const triggeredEvents: GameEvent[] = [
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
    id: 'trg-cheering',
    kind: 'triggered',
    trigger: (s) => s.stats.approval > 85,
    cooldown: 6,
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
      { text: { en: 'Call early elections', ru: 'Провести досрочные выборы', uz: 'Muddatdan oldin saylov o‘tkazish' }, effects: [{ target: 'approval', delta: 2 }, { target: 'eliteLoyalty', delta: -3 }, { target: 'vector', delta: -6 }] },
      { text: { en: 'Extend your term', ru: 'Продлить полномочия', uz: 'Vakolatni uzaytirish' }, effects: [{ target: 'eliteLoyalty', delta: 5 }, { target: 'approval', delta: -4 }, { target: 'vector', delta: 8 }] },
      { text: { en: 'Stay modest', ru: 'Остаться скромным', uz: 'Kamtar qolish' }, effects: [{ target: 'stability', delta: 3 }, { target: 'vector', delta: -2 }] },
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
