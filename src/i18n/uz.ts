import type { Ui } from './types';

export const uz: Ui = {
  menu: {
    eyebrow: 'Absurdiston Respublikasi · mutlaqo maxfiy',
    title: 'DAVLAT BOSHLIG‘I',
    subtitle: 'Hokimiyatning satirik simulyatori. Xalq, elitalar va sog‘lom aql — sizga qarshi.',
    stamp: 'Ijro etilsin',
    continue: 'Hukmronlikni davom ettirish',
    difficulties: {
      easy: { name: 'Oson', tagline: 'Barqarorlik' },
      normal: { name: 'O‘rtacha', tagline: 'O‘tish davri' },
      hard: { name: 'Qiyin', tagline: 'Hammasi murakkab' },
    },
  },
  map: {
    playCta: 'O‘ynash',
    listButton: 'Ro‘yxat',
    loading: 'Xarita yuklanmoqda…',
    searchPlaceholder: 'Davlatni qidirish…',
    close: 'Yopish',
    continents: {
      westernEurope: 'G‘arbiy Yevropa',
      easternEurope: 'Sharqiy Yevropa',
      northAmerica: 'Shimoliy Amerika',
      southAmerica: 'Janubiy Amerika',
      centralAsia: 'Markaziy Osiyo',
      middleEast: 'Yaqin Sharq',
      southSoutheastAsia: 'Janubiy va Janubi-sharqiy Osiyo',
      easternAsia: 'Sharqiy Osiyo',
      oceania: 'Okeaniya',
    },
    chooseRegion: 'Regionni tanlang',
    backToRegions: 'Regionlar',
    dossier: {
      population: 'Aholi',
      area: 'Maydon',
      economy: 'Iqtisodiyot darajasi',
      corruption: 'Korrupsiya',
      democracy: 'Demokratiya',
      development: 'Rivojlanish',
    },
    choose: 'Tanlash',
  },
  settings: {
    title: 'Sozlamalar',
    language: 'Til',
  },
  main: {
    influence: 'Ta’sir',
    brief: 'Mamlakat bo‘yicha ma’lumot',
    reforms: 'Islohotlar',
    autosave: 'Avtomatik saqlanadi. Voqelik bilan har qanday o‘xshashlik tasodifiy.',
    term: 'Muddat',
    untilElection: 'saylovgacha',
    monthsShort: 'oy',
    speed: { pause: 'Pauza', normal: 'O‘ynash', fast: 'Tezlashtirish' },
  },
  interTerm: {
    stamp: 'Inauguratsiya',
    flavor: 'Siz yana hokimiyatdasiz. Orkestr tanish bir kuy chalmoqda. Xalq ham, chamasi, kuyni taniydi.',
    continue: 'Qasamyod qilish',
  },
  months: [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
  ],
  vector: {
    heading: 'Boshqaruv vektori',
    zones: {
      democratic: 'Davlat boshlig‘i',
      authoritarian: 'Milliy yetakchi',
      totalitarian: 'Dohiy',
    },
    scale: {
      democracy: 'Demokratiya',
      authoritarianism: 'Avtoritarizm',
      totalitarianism: 'Totalitarizm',
    },
  },
  stats: {
    economy: 'Iqtisodiyot',
    treasury: 'Xazina',
    approval: 'Xalq ma’qullashi',
    eliteLoyalty: 'Elita sadoqati',
    stability: 'Barqarorlik',
    development: 'Rivojlanish',
    corruption: 'Korrupsiya',
  },
  branches: {
    economy: 'Iqtisodiyot',
    force: 'Kuch tuzilmalari',
    social: 'Ijtimoiy soha',
    propaganda: 'Targ‘ibot',
  },
  reformsPanel: {
    title: 'Islohotlar',
    close: 'Yopish',
    influencePoints: 'Ta’sir ballari',
    treasury: 'Xazina',
    adopted: 'Qabul qilindi',
    costInfluence: 'ta’sir',
    costTreasury: 'xazina',
    approve: 'Qabul qilish',
    locked: 'Qulflangan',
    tier: 'Daraja',
    effectsInstant: 'Darhol',
    effectsPerMonth: 'Har oy',
    reason: {
      needsPrevious: 'oldingi islohot kerak',
      notEnoughInfluence: 'ta’sir yetarli emas',
      notEnoughTreasury: 'xazina yetarli emas',
    },
  },
  event: {
    dispatch: 'Shoshilinch ma’lumot',
  },
  trend: 'tendensiya',
  gameOver: {
    stampVictory: 'Muddat o‘taldi',
    stampDefeat: 'Lavozimdan chetlatildi',
    survived: 'Chidalgan oylar',
    playAgain: 'Yana o‘ynash',
    toMenu: 'Menyuga',
  },
  defeat: {
    coup: {
      title: 'To‘ntarish',
      text: 'Sizni ertalab soat 4 da uyg‘otishdi va xushmuomalalik bilan «o‘z xohishingiz bilan» ariza yozishni so‘rashdi. Ruchkani o‘zlariniki berishdi.',
    },
    revolution: {
      title: 'Inqilob',
      text: 'Xalq saroyga kirdi. Siz derazadan chiqib ketdingiz. Yaxshiyamki, birinchi qavat ekan.',
    },
    default: {
      title: 'Defolt',
      text: 'Xazina shu qadar bo‘shki, kreditorlar hatto eshikdagi taxtachani ham olib ketishdi. Mamlakat yashashda davom etadi — endi sizsiz.',
    },
    elections: {
      title: 'Yutqazilgan saylov',
      text: 'Saylovni halol o‘tkazdingiz va uni halol yutqazdingiz. Tarixchilar buni sizning eng katta yutug‘ingiz deb atashadi.',
    },
  },
  victory: {
    steppedDown: {
      title: 'Mag‘lub bo‘lmay ketdi',
      text: 'Vakolatlaringizni o‘zingiz topshirdingiz — butun, o‘z vaqtida va o‘z ixtiyoringiz bilan. Bu mamlakatda hali hech kim bunday qilmagan. Darsliklar dovdirab qoladi.',
    },
    fatherDemocracy: {
      title: 'Demokratiya otasi',
      text: 'Siz haqingizda darsliklarda yozishadi. Yaxshi boblarida.',
    },
    fatherNation: {
      title: 'Millat otasi, rasman o‘lmas',
      text: 'Parlament bir ovozdan siz abadiy ekaningizni qaror qildi. Parlament nima qilayotganini biladi.',
    },
    manager: {
      title: 'Puxta xo‘jayin',
      text: 'Mamlakat ishlayapti. Qanday qilib — hech kim tushunmaydi, lekin ishlayapti.',
    },
    okay: {
      title: 'Xo‘sh, yomonmas',
      text: 'Muddat o‘taldi, mamlakat joyida. Haykal qo‘yishmaydi, lekin buzadigan narsa ham yo‘q.',
    },
    survived: {
      title: 'Hech bo‘lmasa otib tashlashmadi',
      text: 'Muddat oxirigacha omon qoldingiz. Hozirgi o‘lchovlar bo‘yicha — bu allaqachon davlat yutug‘i.',
    },
  },
};
