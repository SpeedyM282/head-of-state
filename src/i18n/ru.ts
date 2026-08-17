import type { Ui } from './types';

export const ru: Ui = {
  menu: {
    title: 'ГЛАВА ГОСУДАРСТВА',
    subtitle: 'Сатирический симулятор власти. Народ, элиты и здравый смысл — против вас.',
    continue: 'Продолжить правление',
    difficulties: {
      easy: { name: 'Лёгкая', tagline: 'Стабильность' },
      normal: { name: 'Средняя', tagline: 'Переходный период' },
      hard: { name: 'Сложная', tagline: 'Всё сложно' },
    },
  },
  map: {
    playCta: 'Играть',
    listButton: 'Списком',
    loading: 'Загрузка карты…',
    searchPlaceholder: 'Поиск страны…',
    close: 'Закрыть',
    continents: {
      westernEurope: 'Западная Европа',
      easternEurope: 'Восточная Европа',
      northAmerica: 'Северная Америка',
      southAmerica: 'Южная Америка',
      centralAsia: 'Центральная Азия',
      middleEast: 'Ближний Восток',
      southSoutheastAsia: 'Южная и Юго-Восточная Азия',
      easternAsia: 'Восточная Азия',
      oceania: 'Океания',
      northAfrica: 'Северная Африка',
      westernAfrica: 'Западная Африка',
      centralAfrica: 'Центральная Африка',
      easternAfrica: 'Восточная Африка',
      southernAfrica: 'Южная Африка',
    },
    chooseRegion: 'Выберите регион',
    backToRegions: 'Регионы',
    dossier: {
      population: 'Население',
      area: 'Площадь',
      economy: 'Уровень экономики',
      corruption: 'Коррупция',
      democracy: 'Демократия',
      development: 'Развитие',
    },
    choose: 'Выбрать',
  },
  settings: {
    title: 'Настройки',
    language: 'Язык',
  },
  orientationGate: {
    title: 'Поверните устройство',
    hint: 'Государственные дела ведутся только в альбомной ориентации.',
  },
  main: {
    influence: 'Влияние',
    brief: 'Сводка по стране',
    reforms: 'Реформы',
    autosave: 'Сохраняется автоматически. Все совпадения с реальностью случайны.',
    term: 'Срок',
    untilElection: 'до выборов',
    monthsShort: 'мес.',
    speed: { pause: 'Пауза', normal: 'Играть', fast: 'Ускорить' },
  },
  interTerm: {
    stamp: 'Инаугурация',
    flavor: 'Вы снова у власти. Оркестр играет что-то знакомое. Народ, кажется, тоже узнаёт мелодию.',
    continue: 'Принять присягу',
  },
  months: [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ],
  vector: {
    heading: 'Вектор правления',
    zones: {
      democratic: 'Глава государства',
      authoritarian: 'Национальный лидер',
      totalitarian: 'Вождь',
    },
    scale: {
      democracy: 'Демократия',
      authoritarianism: 'Авторитаризм',
      totalitarianism: 'Тоталитаризм',
    },
  },
  stats: {
    economy: 'Экономика',
    treasury: 'Казна',
    approval: 'Одобрение народа',
    eliteLoyalty: 'Лояльность элит',
    stability: 'Стабильность',
    development: 'Развитие',
    corruption: 'Коррупция',
  },
  branches: {
    economy: 'Экономика',
    force: 'Силовой блок',
    social: 'Социалка',
    propaganda: 'Пропаганда',
  },
  reformsPanel: {
    title: 'Реформы',
    close: 'Закрыть',
    influencePoints: 'Очки влияния',
    treasury: 'Казна',
    adopted: 'Принято',
    costInfluence: 'вл',
    costTreasury: 'казна',
    approve: 'Принять',
    locked: 'Заблокировано',
    tier: 'Уровень',
    effectsInstant: 'Сразу',
    effectsPerMonth: 'Каждый месяц',
    reason: {
      needsPrevious: 'нужна предыдущая реформа',
      notEnoughInfluence: 'не хватает влияния',
      notEnoughTreasury: 'не хватает казны',
    },
  },
  event: {
    dispatch: 'Срочное донесение',
  },
  trend: 'тренд',
  gameOver: {
    stampVictory: 'Срок отбыт',
    stampDefeat: 'Отстранён',
    survived: 'Продержались месяцев',
    playAgain: 'Играть снова',
    toMenu: 'В меню',
  },
  defeat: {
    coup: {
      title: 'Переворот',
      text: 'Вас разбудили в 4 утра и вежливо попросили подписать заявление «по собственному желанию». Ручку дали свою.',
    },
    revolution: {
      title: 'Революция',
      text: 'Народ вошёл во дворец. Вы вышли через окно. Хорошо, что первый этаж.',
    },
    default: {
      title: 'Дефолт',
      text: 'Казна пуста настолько, что кредиторы забрали даже табличку с двери. Страна продолжит существовать — но уже без вас.',
    },
    elections: {
      title: 'Проигранные выборы',
      text: 'Вы честно провели выборы и честно их проиграли. Историки назовут это вашим главным достижением.',
    },
  },
  victory: {
    steppedDown: {
      title: 'Ушёл непобеждённым',
      text: 'Вы сами сложили полномочия — целыми, вовремя и по собственной воле. В этой стране так ещё никто не делал. Учебники будут в замешательстве.',
    },
    fatherDemocracy: {
      title: 'Отец демократии',
      text: 'Про вас напишут в учебниках. В хороших главах.',
    },
    fatherNation: {
      title: 'Отец нации, официально бессмертный',
      text: 'Парламент единогласно постановил, что вы вечны. Парламент знает, что делает.',
    },
    manager: {
      title: 'Крепкий хозяйственник',
      text: 'Страна работает. Как — никто не понимает, но работает.',
    },
    okay: {
      title: 'Ну, нормально',
      text: 'Срок отсижен, страна на месте. Памятник не поставят, но и сносить нечего.',
    },
    survived: {
      title: 'Ну хотя бы не расстреляли',
      text: 'Вы дожили до конца срока. По нынешним меркам — уже государственный успех.',
    },
  },
};
