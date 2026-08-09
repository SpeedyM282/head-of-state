import type { GameEvent } from '../../core/types';

/**
 * Random events (24). Once-only by default (see GameEvent.once / eventEngine):
 * each fires at most once per game, so the pool drains over a long term.
 * Every option is a real trade-off; most shift the governance vector.
 */
export const randomEvents: GameEvent[] = [
  {
    id: 'rnd-inflation-word',
    kind: 'random',
    title: {
      en: 'Fighting inflation',
      ru: 'Борьба с инфляцией',
      uz: 'Inflyatsiyaga qarshi kurash',
    },
    text: {
      en: 'The economy minister proposes to defeat inflation by banning the word “inflation”.',
      ru: 'Министр экономики предлагает победить инфляцию, запретив слово «инфляция».',
      uz: 'Iqtisodiyot vaziri «inflyatsiya» so‘zini taqiqlab, inflyatsiyani yengishni taklif qilmoqda.',
    },
    options: [
      { text: { en: 'Brilliant. Ban it', ru: 'Гениально. Запретить', uz: 'Zo‘r. Taqiqlansin' }, effects: [{ target: 'approval', delta: 4 }, { target: 'economy', delta: -4 }, { target: 'vector', delta: 5 }] },
      { text: { en: 'Fire the minister', ru: 'Уволить министра', uz: 'Vazirni ishdan bo‘shatish' }, effects: [{ target: 'eliteLoyalty', delta: -5 }, { target: 'economy', delta: 3 }] },
      { text: { en: 'Pretend you did not hear', ru: 'Сделать вид, что не слышали', uz: 'Eshitmaganga olish' }, effects: [{ target: 'stability', delta: -2 }] },
    ],
  },
  {
    id: 'rnd-drought',
    kind: 'random',
    title: {
      en: 'Drought',
      ru: 'Засуха',
      uz: 'Qurg‘oqchilik',
    },
    text: {
      en: 'The harvest is dead. The agriculture minister proposes to declare it a “scheduled rest for the fields”.',
      ru: 'Урожай погиб. Министр сельского хозяйства предлагает объявить это «плановым отдыхом полей».',
      uz: 'Hosil nobud bo‘ldi. Qishloq xo‘jaligi vaziri buni «dalalarning rejali dam olishi» deb e’lon qilishni taklif qilmoqda.',
    },
    options: [
      { text: { en: 'Buy grain abroad', ru: 'Закупить зерно за рубежом', uz: 'Chet eldan g‘alla sotib olish' }, effects: [{ target: 'treasury', delta: -10 }, { target: 'approval', delta: 3 }] },
      { text: { en: 'The fields are resting — that is our story', ru: 'Поля отдыхают — так и скажем', uz: 'Dalalar dam olyapti — shunday deymiz' }, effects: [{ target: 'approval', delta: -6 }, { target: 'stability', delta: -3 }] },
    ],
  },
  {
    id: 'rnd-meme',
    kind: 'random',
    title: {
      en: 'Viral meme',
      ru: 'Вирусный мем',
      uz: 'Viral mem',
    },
    text: {
      en: 'A meme with your face has gone viral. It is funny. Insultingly funny.',
      ru: 'В сети завирусился мем с вашим лицом. Смешной. Обидно смешной.',
      uz: 'Tarmoqda sizning yuzingiz bilan mem viral bo‘ldi. Kulgili. Alam qiladigan darajada kulgili.',
    },
    options: [
      { text: { en: 'Laugh about it publicly', ru: 'Посмеяться публично', uz: 'Ommaviy kulib qo‘yish' }, effects: [{ target: 'approval', delta: 6 }, { target: 'vector', delta: -3 }] },
      { text: { en: 'Find the author', ru: 'Найти автора', uz: 'Muallifni topish' }, effects: [{ target: 'approval', delta: -5 }, { target: 'stability', delta: 2 }, { target: 'vector', delta: 6 }] },
    ],
  },
  {
    id: 'rnd-corruption',
    kind: 'random',
    title: {
      en: 'Corruption scandal',
      ru: 'Коррупционный скандал',
      uz: 'Korrupsiya janjali',
    },
    text: {
      en: 'The construction minister built himself a palace. Journalists calculated it would take 400 years on his salary.',
      ru: 'Министр строительства построил себе дворец. Журналисты посчитали, что на его зарплату это заняло бы 400 лет.',
      uz: 'Qurilish vaziri o‘ziga saroy qurdi. Jurnalistlar hisoblab chiqishdi: uning maoshiga bu 400 yil kerak bo‘lardi.',
    },
    options: [
      { text: { en: 'Jail him for show', ru: 'Посадить показательно', uz: 'Ibrat uchun qamash' }, effects: [{ target: 'approval', delta: 8 }, { target: 'eliteLoyalty', delta: -8 }] },
      { text: { en: 'Put him in charge of the investigation', ru: 'Назначить его же расследовать', uz: 'Uni o‘zini tergov qilishga tayinlash' }, effects: [{ target: 'approval', delta: -6 }, { target: 'eliteLoyalty', delta: 5 }, { target: 'vector', delta: 4 }] },
      { text: { en: 'Declare the palace a museum', ru: 'Объявить дворец музеем', uz: 'Saroyni muzey deb e’lon qilish' }, effects: [{ target: 'approval', delta: -2 }, { target: 'treasury', delta: 3 }] },
    ],
  },
  {
    id: 'rnd-bridge',
    kind: 'random',
    title: {
      en: 'Grand opening',
      ru: 'Торжественное открытие',
      uz: 'Tantanali ochilish',
    },
    text: {
      en: 'It is time to open the bridge. The bridge is 60% finished, but the ribbon has already been bought.',
      ru: 'Пора открывать мост. Мост готов на 60%, но лента уже куплена.',
      uz: 'Ko‘prikni ochish vaqti keldi. Ko‘prik 60% tayyor, lekin lenta allaqachon sotib olingan.',
    },
    options: [
      { text: { en: 'Open half the bridge', ru: 'Открыть половину моста', uz: 'Ko‘prikning yarmini ochish' }, effects: [{ target: 'approval', delta: 3 }, { target: 'stability', delta: -2 }] },
      { text: { en: 'Postpone and finish building', ru: 'Перенести и достроить', uz: 'Kechiktirib, qurib bitkazish' }, effects: [{ target: 'treasury', delta: -6 }, { target: 'development', delta: 4 }] },
    ],
  },
  {
    id: 'rnd-blogger',
    kind: 'random',
    title: {
      en: 'Opposition blogger',
      ru: 'Оппозиционный блогер',
      uz: 'Muxolif bloger',
    },
    text: {
      en: 'A blogger with a million followers has published an exposé on state purchases of golden toilets.',
      ru: 'Блогер-миллионник выпустил расследование о госзакупках золотых унитазов.',
      uz: 'Millionlab obunachiga ega bloger oltin unitazlarni davlat xaridi haqida tergov e’lon qildi.',
    },
    options: [
      { text: { en: 'Invite them to a debate', ru: 'Пригласить на дебаты', uz: 'Munozaraga taklif qilish' }, effects: [{ target: 'approval', delta: 5 }, { target: 'vector', delta: -5 }, { target: 'eliteLoyalty', delta: -3 }] },
      { text: { en: 'Block the platform', ru: 'Заблокировать платформу', uz: 'Platformani bloklash' }, effects: [{ target: 'approval', delta: -7 }, { target: 'stability', delta: 3 }, { target: 'vector', delta: 8 }] },
    ],
  },
  {
    id: 'rnd-harvest',
    kind: 'random',
    title: {
      en: 'Record harvest',
      ru: 'Рекордный урожай',
      uz: 'Rekord hosil',
    },
    text: {
      en: 'A record cotton harvest has been gathered. The statisticians swear it is honest this time.',
      ru: 'Собран рекордный урожай хлопка. Статистики клянутся, что в этот раз честно.',
      uz: 'Rekord paxta hosili yig‘ildi. Statistiklar bu safar halol ekaniga qasam ichishmoqda.',
    },
    options: [
      { text: { en: 'Sell it abroad', ru: 'Продать за рубеж', uz: 'Chet elga sotish' }, effects: [{ target: 'treasury', delta: 8 }] },
      { text: { en: 'Hand it out to the people', ru: 'Раздать народу', uz: 'Xalqqa tarqatish' }, effects: [{ target: 'approval', delta: 7 }, { target: 'treasury', delta: -2 }] },
    ],
  },
  {
    id: 'rnd-olympiad',
    kind: 'random',
    title: {
      en: 'International olympiad',
      ru: 'Международная олимпиада',
      uz: 'Xalqaro olimpiada',
    },
    text: {
      en: 'A student won the mathematics olympiad. Three countries have already offered them citizenship.',
      ru: 'Школьник выиграл олимпиаду по математике. Три страны уже предложили ему гражданство.',
      uz: 'Maktab o‘quvchisi matematika olimpiadasida g‘olib chiqdi. Uchta davlat allaqachon unga fuqarolik taklif qildi.',
    },
    options: [
      { text: { en: 'A grant and a lab at home', ru: 'Грант и лаборатория дома', uz: 'Grant va uydagi laboratoriya' }, effects: [{ target: 'treasury', delta: -5 }, { target: 'development', delta: 6 }, { target: 'approval', delta: 3 }] },
      { text: { en: 'A photo with you is reward enough', ru: 'Фото с вами — достаточная награда', uz: 'Siz bilan surat — yetarli mukofot' }, effects: [{ target: 'development', delta: -3 }, { target: 'approval', delta: -2 }] },
    ],
  },
  {
    id: 'rnd-minister-sleep',
    kind: 'random',
    title: {
      en: 'The sleeping minister',
      ru: 'Уснувший министр',
      uz: 'Uxlab qolgan vazir',
    },
    text: {
      en: 'The energy minister fell asleep at a meeting on energy. The video got a million views.',
      ru: 'Министр энергетики уснул на совещании по энергетике. Видео набрало миллион просмотров.',
      uz: 'Energetika vaziri energetika bo‘yicha yig‘ilishda uxlab qoldi. Video million marta ko‘rildi.',
    },
    options: [
      { text: { en: 'Fire them', ru: 'Уволить', uz: 'Ishdan bo‘shatish' }, effects: [{ target: 'approval', delta: 4 }, { target: 'eliteLoyalty', delta: -4 }] },
      { text: { en: '“They were thinking with their eyes closed”', ru: '«Он думал с закрытыми глазами»', uz: '«U ko‘zini yumib o‘ylayotgan edi»' }, effects: [{ target: 'approval', delta: -3 }, { target: 'eliteLoyalty', delta: 3 }] },
    ],
  },
  {
    id: 'rnd-crypto',
    kind: 'random',
    title: {
      en: 'Crypto fever',
      ru: 'Криптовалютная лихорадка',
      uz: 'Kripto isitmasi',
    },
    text: {
      en: 'An adviser proposes investing the treasury in the “AbsurdCoin” cryptocurrency. The logo has already been drawn.',
      ru: 'Советник предлагает вложить казну в криптовалюту «АбсурдКоин». Логотип уже нарисован.',
      uz: 'Maslahatchi xazinani «AbsurdKoin» kriptovalyutasiga sarmoya qilishni taklif qilmoqda. Logotip allaqachon chizilgan.',
    },
    options: [
      { text: { en: 'Invest', ru: 'Вложиться', uz: 'Sarmoya kiritish' }, effects: [{ target: 'treasury', delta: -8 }, { target: 'economy', delta: 2 }] },
      { text: { en: 'Decline', ru: 'Отказаться', uz: 'Rad etish' }, effects: [{ target: 'eliteLoyalty', delta: -2 }] },
      { text: { en: 'Ban crypto altogether', ru: 'Запретить крипту вообще', uz: 'Kriptoni umuman taqiqlash' }, effects: [{ target: 'economy', delta: -3 }, { target: 'vector', delta: 4 }] },
    ],
  },

  // ─── New (14) ───
  {
    id: 'rnd-monument',
    kind: 'random',
    title: {
      en: 'A monument while you live',
      ru: 'Памятник при жизни',
      uz: 'Tirikligingizda haykal',
    },
    text: {
      en: 'Parliament proposes erecting a monument to you. While you are alive. Full height, with a horse.',
      ru: 'Парламент предлагает поставить вам памятник. При жизни. В полный рост и с конём.',
      uz: 'Parlament sizga haykal o‘rnatishni taklif qilmoqda. Tirikligingizda. To‘liq bo‘yda va ot bilan.',
    },
    options: [
      { text: { en: 'Agree, but without the horse', ru: 'Согласиться, но без коня', uz: 'Rozi bo‘lish, lekin otsiz' }, effects: [{ target: 'approval', delta: 3 }, { target: 'treasury', delta: -4 }, { target: 'vector', delta: 3 }] },
      { text: { en: 'Modestly decline', ru: 'Скромно отказаться', uz: 'Kamtarlik bilan rad etish' }, effects: [{ target: 'approval', delta: 4 }, { target: 'eliteLoyalty', delta: -3 }, { target: 'vector', delta: -3 }] },
      { text: { en: 'Erect two', ru: 'Поставить два', uz: 'Ikkitasini o‘rnatish' }, effects: [{ target: 'approval', delta: 2 }, { target: 'treasury', delta: -8 }, { target: 'vector', delta: 6 }] },
    ],
  },
  {
    id: 'rnd-football',
    kind: 'random',
    title: {
      en: 'Football rout',
      ru: 'Футбольный разгром',
      uz: 'Futbol mag‘lubiyati',
    },
    text: {
      en: 'The national team lost 0:7. The coach says it was a tactical sacrifice.',
      ru: 'Сборная проиграла 0:7. Тренер говорит, что это была тактическая жертва.',
      uz: 'Terma jamoa 0:7 yutqazdi. Murabbiy buni taktik qurbonlik deydi.',
    },
    options: [
      { text: { en: 'Naturalize foreign players', ru: 'Натурализовать легионеров', uz: 'Legionerlarni fuqarolikka olish' }, effects: [{ target: 'treasury', delta: -6 }, { target: 'approval', delta: 5 }] },
      { text: { en: 'Declare it a victory of spirit', ru: 'Объявить это победой духа', uz: 'Buni ruh g‘alabasi deb e’lon qilish' }, effects: [{ target: 'approval', delta: -4 }, { target: 'stability', delta: 2 }, { target: 'vector', delta: 4 }] },
    ],
  },
  {
    id: 'rnd-weather',
    kind: 'random',
    title: {
      en: 'The forecasters failed',
      ru: 'Синоптики подвели',
      uz: 'Sinoptiklar qoqinishdi',
    },
    text: {
      en: 'They promised sun; a flood came. The minister proposes fining forecasters for pessimism.',
      ru: 'Обещали солнце — пришёл потоп. Министр предлагает штрафовать синоптиков за пессимизм.',
      uz: 'Quyosh va’da qilishdi — to‘fon keldi. Vazir sinoptiklarni pessimizm uchun jarimaga tortishni taklif qilmoqda.',
    },
    options: [
      { text: { en: 'Help the flooded regions', ru: 'Помочь подтопленным', uz: 'Suv bosgan hududlarga yordam berish' }, effects: [{ target: 'treasury', delta: -8 }, { target: 'approval', delta: 6 }] },
      { text: { en: 'Fine the forecasters', ru: 'Штрафовать синоптиков', uz: 'Sinoptiklarni jarimaga tortish' }, effects: [{ target: 'approval', delta: -3 }, { target: 'treasury', delta: 2 }, { target: 'vector', delta: 4 }] },
      { text: { en: 'Do nothing', ru: 'Ничего не делать', uz: 'Hech narsa qilmaslik' }, effects: [{ target: 'approval', delta: -5 }, { target: 'stability', delta: -2 }] },
    ],
  },
  {
    id: 'rnd-holiday',
    kind: 'random',
    title: {
      en: 'A new holiday',
      ru: 'Новый праздник',
      uz: 'Yangi bayram',
    },
    text: {
      en: 'An adviser proposes a Day of Your Rise to Power. A day off, of course.',
      ru: 'Советник предлагает учредить День Вашего Прихода к Власти. Выходной, разумеется.',
      uz: 'Maslahatchi Sizning Hokimiyatga Kelish Kuningizni ta’sis etishni taklif qilmoqda. Albatta, dam olish kuni.',
    },
    options: [
      { text: { en: 'Establish it lavishly', ru: 'Учредить с размахом', uz: 'Keng ko‘lamda ta’sis etish' }, effects: [{ target: 'approval', delta: 6 }, { target: 'economy', delta: -3 }, { target: 'treasury', delta: -4 }, { target: 'vector', delta: 5 }] },
      { text: { en: 'Make it a working day', ru: 'Сделать рабочим днём', uz: 'Ish kuni qilish' }, effects: [{ target: 'approval', delta: -4 }, { target: 'economy', delta: 2 }] },
    ],
  },
  {
    id: 'rnd-oligarch',
    kind: 'random',
    title: {
      en: 'Oligarchs’ quarrel',
      ru: 'Ссора олигархов',
      uz: 'Oligarxlar janjali',
    },
    text: {
      en: 'Two oligarchs cannot split a factory. Both are calling you. Both think you owe them.',
      ru: 'Два олигарха не поделили завод. Оба звонят вам. Оба считают, что вы им должны.',
      uz: 'Ikki oligarx zavodni bo‘lisha olmayapti. Ikkalasi ham sizga qo‘ng‘iroq qilmoqda. Ikkalasi ham sizni ularga qarzdor deb biladi.',
    },
    options: [
      { text: { en: 'Nationalize the factory', ru: 'Забрать завод государству', uz: 'Zavodni davlatga olish' }, effects: [{ target: 'treasury', delta: 6 }, { target: 'eliteLoyalty', delta: -6 }, { target: 'vector', delta: 5 }] },
      { text: { en: 'Back one of them', ru: 'Поддержать одного', uz: 'Birini qo‘llab-quvvatlash' }, effects: [{ target: 'eliteLoyalty', delta: 4 }, { target: 'approval', delta: -3 }] },
      { text: { en: 'Reconcile them over dinner', ru: 'Помирить за ужином', uz: 'Kechki ovqatda yarashtirish' }, effects: [{ target: 'eliteLoyalty', delta: 2 }, { target: 'treasury', delta: -3 }] },
    ],
  },
  {
    id: 'rnd-ai',
    kind: 'random',
    title: {
      en: 'State AI',
      ru: 'Государственный ИИ',
      uz: 'Davlat sun’iy intellekti',
    },
    text: {
      en: 'A ministry proposes replacing officials with AI. The AI has already agreed.',
      ru: 'Министерство предлагает заменить чиновников искусственным интеллектом. ИИ уже согласился.',
      uz: 'Vazirlik amaldorlarni sun’iy intellekt bilan almashtirishni taklif qilmoqda. SI allaqachon rozi bo‘ldi.',
    },
    options: [
      { text: { en: 'Deploy it', ru: 'Внедрить', uz: 'Joriy etish' }, effects: [{ target: 'development', delta: 7 }, { target: 'eliteLoyalty', delta: -6 }, { target: 'treasury', delta: -5 }] },
      { text: { en: 'Only for paperwork', ru: 'Только для отчётности', uz: 'Faqat hisobot uchun' }, effects: [{ target: 'development', delta: 3 }, { target: 'economy', delta: 2 }] },
      { text: { en: 'Ban it as a threat', ru: 'Запретить как угрозу', uz: 'Tahdid sifatida taqiqlash' }, effects: [{ target: 'development', delta: -4 }, { target: 'vector', delta: 4 }] },
    ],
  },
  {
    id: 'rnd-census',
    kind: 'random',
    title: {
      en: 'The census',
      ru: 'Перепись населения',
      uz: 'Aholini ro‘yxatga olish',
    },
    text: {
      en: 'The census found three million fewer people than the reports say. Or more. They counted twice and got different results.',
      ru: 'Перепись показала, что народу на три миллиона меньше, чем в отчётах. Или больше. Считали дважды, вышло по-разному.',
      uz: 'Ro‘yxat hisobotlardagidan uch million kam odam borligini ko‘rsatdi. Yoki ko‘p. Ikki marta sanashdi, har xil chiqdi.',
    },
    options: [
      { text: { en: 'Accept the honest numbers', ru: 'Признать честные цифры', uz: 'Halol raqamlarni tan olish' }, effects: [{ target: 'approval', delta: 4 }, { target: 'economy', delta: -3 }, { target: 'vector', delta: -4 }] },
      { text: { en: 'Round in the right direction', ru: 'Округлить в нужную сторону', uz: 'Kerakli tomonga yaxlitlash' }, effects: [{ target: 'approval', delta: -2 }, { target: 'stability', delta: 2 }, { target: 'vector', delta: 5 }] },
    ],
  },
  {
    id: 'rnd-border',
    kind: 'random',
    title: {
      en: 'The border post',
      ru: 'Пограничный столб',
      uz: 'Chegara ustuni',
    },
    text: {
      en: 'The neighbors moved the border post three meters. In their favor. They blame the wind.',
      ru: 'Соседи передвинули пограничный столб на три метра. В свою пользу. Говорят, ветром.',
      uz: 'Qo‘shnilar chegara ustunini uch metrga ko‘chirdi. O‘z foydasiga. Shamol aybdor deyishadi.',
    },
    options: [
      { text: { en: 'Move it back at night', ru: 'Передвинуть обратно ночью', uz: 'Kechasi joyiga qaytarish' }, effects: [{ target: 'stability', delta: 2 }, { target: 'eliteLoyalty', delta: 3 }, { target: 'vector', delta: 4 }] },
      { text: { en: 'File a protest note', ru: 'Подать ноту протеста', uz: 'Norozilik notasini yuborish' }, effects: [{ target: 'approval', delta: 2 }, { target: 'economy', delta: -2 }] },
      { text: { en: 'Cede the three meters', ru: 'Уступить три метра', uz: 'Uch metrni berib qo‘yish' }, effects: [{ target: 'approval', delta: -6 }, { target: 'stability', delta: 3 }] },
    ],
  },
  {
    id: 'rnd-teacher',
    kind: 'random',
    title: {
      en: 'Teacher of the year',
      ru: 'Учитель года',
      uz: 'Yil o‘qituvchisi',
    },
    text: {
      en: 'The country’s best teacher criticized the curriculum live on air. Especially the chapter about you.',
      ru: 'Лучший учитель страны в прямом эфире раскритиковал школьную программу. Особенно главу о вас.',
      uz: 'Mamlakatning eng yaxshi o‘qituvchisi jonli efirda o‘quv dasturini tanqid qildi. Ayniqsa siz haqingizdagi bobni.',
    },
    options: [
      { text: { en: 'Invite them to rewrite the chapter', ru: 'Пригласить переписать главу', uz: 'Bobni qayta yozishga taklif qilish' }, effects: [{ target: 'development', delta: 5 }, { target: 'approval', delta: 3 }, { target: 'vector', delta: -4 }] },
      { text: { en: 'Strip the title', ru: 'Лишить звания', uz: 'Unvondan mahrum qilish' }, effects: [{ target: 'approval', delta: -5 }, { target: 'development', delta: -3 }, { target: 'vector', delta: 5 }] },
    ],
  },
  {
    id: 'rnd-power',
    kind: 'random',
    title: {
      en: 'Blackout',
      ru: 'Отключение света',
      uz: 'Yorug‘lik o‘chishi',
    },
    text: {
      en: 'During your address to the nation the power went out. Across the whole capital. Symbolic, the internet jokes.',
      ru: 'Во время вашего обращения к нации погас свет. Во всей столице. Символично, шутят в сети.',
      uz: 'Millatga murojaatingiz paytida yorug‘lik o‘chdi. Butun poytaxtda. Ramziy, deb hazillashadi tarmoqda.',
    },
    options: [
      { text: { en: 'Invest in the grid', ru: 'Вложиться в энергосети', uz: 'Energetika tarmog‘iga sarmoya' }, effects: [{ target: 'treasury', delta: -9 }, { target: 'development', delta: 5 }, { target: 'economy', delta: 2 }] },
      { text: { en: 'Find the culprits', ru: 'Найти виновных', uz: 'Aybdorlarni topish' }, effects: [{ target: 'approval', delta: -3 }, { target: 'eliteLoyalty', delta: -3 }, { target: 'vector', delta: 4 }] },
      { text: { en: 'Candles are cozy', ru: 'Свечи — это уютно', uz: 'Shamlar — bu qulay' }, effects: [{ target: 'approval', delta: -5 }, { target: 'stability', delta: -2 }] },
    ],
  },
  {
    id: 'rnd-fashion',
    kind: 'random',
    title: {
      en: 'National costume',
      ru: 'Национальный костюм',
      uz: 'Milliy kostyum',
    },
    text: {
      en: 'A designer created a mandatory national costume. It is patriotic. And itchy.',
      ru: 'Дизайнер разработал обязательный национальный костюм. Он патриотичный. И колючий.',
      uz: 'Dizayner majburiy milliy kostyum ishlab chiqdi. U vatanparvarona. Va tikanli.',
    },
    options: [
      { text: { en: 'Require it for officials', ru: 'Ввести для чиновников', uz: 'Amaldorlar uchun joriy etish' }, effects: [{ target: 'approval', delta: 2 }, { target: 'eliteLoyalty', delta: -4 }, { target: 'vector', delta: 5 }] },
      { text: { en: 'Only on holidays', ru: 'Только по праздникам', uz: 'Faqat bayramlarda' }, effects: [{ target: 'approval', delta: 3 }, { target: 'treasury', delta: -2 }] },
      { text: { en: 'Reject it', ru: 'Отклонить', uz: 'Rad etish' }, effects: [{ target: 'eliteLoyalty', delta: -2 }, { target: 'vector', delta: -2 }] },
    ],
  },
  {
    id: 'rnd-lottery',
    kind: 'random',
    title: {
      en: 'State lottery',
      ru: 'Государственная лотерея',
      uz: 'Davlat lotereyasi',
    },
    text: {
      en: 'The finance ministry proposes a state lottery: the people pay, the treasury wins. Always.',
      ru: 'Минфин предлагает гослотерею: народ платит, казна выигрывает. Всегда.',
      uz: 'Moliya vazirligi davlat lotereyasini taklif qilmoqda: xalq to‘laydi, xazina yutadi. Har doim.',
    },
    options: [
      { text: { en: 'Launch it', ru: 'Запустить', uz: 'Ishga tushirish' }, effects: [{ target: 'treasury', delta: 8 }, { target: 'approval', delta: -4 }, { target: 'vector', delta: 3 }] },
      { text: { en: 'Make it fair', ru: 'Сделать честной', uz: 'Halol qilish' }, effects: [{ target: 'treasury', delta: 3 }, { target: 'approval', delta: 2 }] },
    ],
  },
  {
    id: 'rnd-spy',
    kind: 'random',
    title: {
      en: 'Spy scandal',
      ru: 'Шпионский скандал',
      uz: 'Josuslik janjali',
    },
    text: {
      en: 'Counterintelligence caught a foreign spy. During questioning it turned out he was a tourist with a map.',
      ru: 'Контрразведка поймала иностранного шпиона. При допросе выяснилось, что это турист с картой.',
      uz: 'Aksilrazvedka chet ellik josusni ushladi. So‘roq paytida u xaritali turist ekani ma’lum bo‘ldi.',
    },
    options: [
      { text: { en: 'Apologize quietly', ru: 'Тихо извиниться', uz: 'Jimgina uzr so‘rash' }, effects: [{ target: 'approval', delta: 2 }, { target: 'eliteLoyalty', delta: -2 }, { target: 'vector', delta: -3 }] },
      { text: { en: 'Show him on TV as a spy anyway', ru: 'Всё равно показать по ТВ как шпиона', uz: 'Baribir uni josus sifatida TVda ko‘rsatish' }, effects: [{ target: 'approval', delta: 4 }, { target: 'economy', delta: -2 }, { target: 'vector', delta: 5 }] },
    ],
  },
  {
    id: 'rnd-anthem',
    kind: 'random',
    title: {
      en: 'New anthem',
      ru: 'Новый гимн',
      uz: 'Yangi madhiya',
    },
    text: {
      en: 'A composer wrote a new anthem. The melody is catchy. It lasts twelve minutes.',
      ru: 'Композитор написал новый гимн. Мелодия цепляет. Длится двенадцать минут.',
      uz: 'Bastakor yangi madhiya yozdi. Ohang yoqimli. O‘n ikki daqiqa davom etadi.',
    },
    options: [
      { text: { en: 'Adopt the full version', ru: 'Принять полную версию', uz: 'To‘liq versiyani qabul qilish' }, effects: [{ target: 'approval', delta: 4 }, { target: 'economy', delta: -2 }, { target: 'vector', delta: 4 }] },
      { text: { en: 'Cut it to a minute', ru: 'Сократить до минуты', uz: 'Bir daqiqagacha qisqartirish' }, effects: [{ target: 'approval', delta: 2 }, { target: 'development', delta: 1 }] },
      { text: { en: 'Keep the old one', ru: 'Оставить старый', uz: 'Eskisini qoldirish' }, effects: [{ target: 'stability', delta: 1 }, { target: 'vector', delta: -2 }] },
    ],
  },
];
