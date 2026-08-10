import type { Ui } from './types';

export const en: Ui = {
  menu: {
    eyebrow: 'Republic of Absurdistan · top secret',
    title: 'PRESIDENT',
    subtitle: 'A satirical simulator of power. The people, the elites, and common sense — all against you.',
    stamp: 'For execution',
    continue: 'Continue your rule',
    difficulties: {
      easy: { name: 'Easy', tagline: 'Stability' },
      normal: { name: 'Medium', tagline: 'Transition period' },
      hard: { name: 'Hard', tagline: 'It’s complicated' },
    },
  },
  main: {
    influence: 'Influence',
    brief: 'Country brief',
    reforms: 'Reforms',
    autosave: 'Saved automatically. Any resemblance to reality is coincidental.',
    speed: { pause: 'Pause', normal: 'Play', fast: 'Fast forward' },
  },
  months: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  vector: {
    heading: 'Governance vector',
    zones: {
      democratic: 'President',
      authoritarian: 'National leader',
      totalitarian: 'Leader',
    },
    scale: {
      democracy: 'Democracy',
      authoritarianism: 'Authoritarianism',
      totalitarianism: 'Totalitarianism',
    },
  },
  stats: {
    economy: 'Economy',
    treasury: 'Treasury',
    approval: 'Public approval',
    eliteLoyalty: 'Elite loyalty',
    stability: 'Stability',
    development: 'Development',
    corruption: 'Corruption',
  },
  branches: {
    economy: 'Economy',
    force: 'Security bloc',
    social: 'Social policy',
    propaganda: 'Propaganda',
  },
  reformsPanel: {
    title: 'Reforms',
    close: 'Close',
    influencePoints: 'Influence points',
    treasury: 'Treasury',
    adopted: 'Adopted',
    costInfluence: 'infl',
    costTreasury: 'treas',
    approve: 'Approve',
    locked: 'Locked',
    tier: 'Tier',
    effectsInstant: 'Immediately',
    effectsPerMonth: 'Every month',
    reason: {
      needsPrevious: 'previous reform required',
      notEnoughInfluence: 'not enough influence',
      notEnoughTreasury: 'not enough treasury',
    },
  },
  event: {
    dispatch: 'Urgent dispatch',
  },
  trend: 'trend',
  gameOver: {
    stampVictory: 'Term served',
    stampDefeat: 'Removed from office',
    survived: 'Months survived',
    playAgain: 'Play again',
    toMenu: 'To menu',
  },
  defeat: {
    coup: {
      title: 'Coup',
      text: 'They woke you at 4 a.m. and politely asked you to sign a resignation letter “of your own free will”. They lent you their own pen.',
    },
    revolution: {
      title: 'Revolution',
      text: 'The people entered the palace. You left through the window. Good thing it was the ground floor.',
    },
    default: {
      title: 'Default',
      text: 'The treasury is so empty the creditors took even the nameplate off the door. The country will go on existing — just without you.',
    },
    elections: {
      title: 'Lost election',
      text: 'You held the election honestly and honestly lost it. Historians will call it your greatest achievement.',
    },
  },
  victory: {
    fatherDemocracy: {
      title: 'Father of democracy',
      text: 'They’ll write about you in the textbooks. In the good chapters.',
    },
    fatherNation: {
      title: 'Father of the nation, officially immortal',
      text: 'Parliament unanimously decreed that you are eternal. Parliament knows what it’s doing.',
    },
    manager: {
      title: 'A solid administrator',
      text: 'The country works. How, nobody understands, but it works.',
    },
    okay: {
      title: 'Well, not bad',
      text: 'The term is served, the country is still there. They won’t build you a monument, but there’s nothing to tear down either.',
    },
    survived: {
      title: 'At least you weren’t shot',
      text: 'You survived to the end of your term. By today’s standards, that’s already a state achievement.',
    },
  },
};
