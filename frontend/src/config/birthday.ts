
export interface MemoryPhoto {
  id: string;
  src: string;
  alt: string;
  caption: string;
  momentLabel: string;
}

export interface BirthdayConfig {
  nickname: string;
  affectionateNickname: string;
  senderName: string;
  theme: {
    canvas: string;
    surface: string;
    blush: string;
    lavender: string;
    cream: string;
    ink: string;
    muted: string;
    accent: string;
    accentHover: string;
    lavenderAccent: string;
  };
  welcome: {
    kicker: string;
    headline: string;
    subheadline: string;
    hint: string;
    buttonLabel: string;
  };
  cake: {
    kicker: string;
    instruction: string;
    candleCount: number;
    headline: string;
    subheadline: string;
    continueLabel: string;
  };
  letter: {
    kicker: string;
    title: string;
    envelopeLabel: string;
    envelopeHint: string;
    paragraphs: string[];
    signature: string;
    continueLabel: string;
  };
  memories: {
    kicker: string;
    title: string;
    subtitle: string;
    photos: MemoryPhoto[];
    continueLabel: string;
  };
  funZone: {
    kicker: string;
    title: string;
    queenQuestion: string;
    queenPromptLabel: string;
    queenAnswer: string;
    queenNote: string;
    complimentButtonLabel: string;
    compliments: string[];
    secretButtonLabel: string;
    secretTitle: string;
    secretMessage: string;
    continueLabel: string;
  };
  finalSurprise: {
    kicker: string;
    headline: string;
    message: string;
    buttonLabel: string;
  };
  feedback: {
    apiUrl?: string;
    kicker: string;
    title: string;
    subtitle: string;
    placeholder: string;
    smileQuestion: string;
    smileOptions: readonly string[];
    submitLabel: string;
    successTitle: string;
    successMessage: string;
  };
  music: {
    enabled: boolean;
    trackTitle: string;
    audioSrc: string;
  };
}

export const birthdayConfig: BirthdayConfig = {
  nickname: 'Baybo',
  affectionateNickname: 'Baybooo',
  senderName: 'Made with love, just for you',

  theme: {
    canvas: '#fdf8fa',
    surface: '#ffffff',
    blush: '#fcebf1',
    lavender: '#f0ebf9',
    cream: '#fdf6ef',
    ink: '#2b1d2e',
    muted: '#6c576e',
    accent: '#d44d7a',
    accentHover: '#bc3965',
    lavenderAccent: '#8264bf',
  },

  welcome: {
    kicker: 'A little gift made just for you',
    headline: 'Hey Baybooo! 💗',
    subheadline: 'I have something special for you...',
    hint: 'Seven little moments are waiting inside',
    buttonLabel: 'Open Your Surprise ✨',
  },

  cake: {
    kicker: 'Chapter 01 · Make a wish',
    instruction: 'Tap every glowing candle to blow it out',
    candleCount: 5,
    headline: 'Happiest Birthday, Baybo! 🎀',
    subheadline: 'Today is all about you. Keep smiling and keep shining!',
    continueLabel: 'Read Your Letter',
  },

  letter: {
    kicker: 'Chapter 02 · Just for you',
    title: 'A Little Letter for You 💌',
    envelopeLabel: 'Sealed for Baybo',
    envelopeHint: 'Tap the envelope to open',

    paragraphs: [
      "I don't know whether you liked it or not. I just tried to wish you in a unique way, with a little touch of my software developer skills. 😅 Secondly, there was a reason why I didn't wish you at 12. I also have a video that I'll share with you.",

      "Initially, I thought of adding a section explaining why I didn't wish you at midnight, but then I thought that if someone opened this link who didn't want to see you with me, they might misuse that information or misbehave with you. That's why I decided to share that part separately. However, I can still add that section to the menu if you want. It's open for editing anyway.",

      "Anyways, **Happiest Birthday To You**, from the depths of my heart! ❤️",

      "I know this year has been quite a roller coaster for our relationship. We've had our ups and downs, moments of anger and distance, and there were times when things almost reached the point of blocking each other. But you're my baby. Pavay maray ton 2 saal waddi va 😂, We've had our ups and downs, but I guess that's what makes our bond special. No matter whether we stay together or not, my best wishes will always be with you.",

      "I genuinely love your silly jokes, our meaningless laughter, our immature conversations, and sometimes our childish behaviour. To me, these little things represent purity, comfort, and genuine love. It's beautiful when you can simply be yourself without pretending or overthinking. That saaf suthra connection is something I truly value.",

      "You can always say that I'm someone who celebrates your achievements, wishes the best for you, and genuinely feels happy seeing you succeed.",

      "No matter where life takes us, I'll always wish to see you happy, blessed, and successful. ❤️"
    ],

    signature: 'Always cheering for you',
    continueLabel: 'Visit the Fun Zone',
  },

  memories: {
    kicker: 'Chapter 03 · Keepsake moments',
    title: 'Little Memories 📸',
    subtitle: 'Swipe through and tap any frame for a closer look. Replace these anytime with our favorite snapshots.',
    photos: [],
    continueLabel: 'Visit the Fun Zone',
  },

  funZone: {
    kicker: 'Chapter 03 · Play a little',
    title: 'A Little Fun Zone 🎀',
    queenQuestion: "Who's the birthday queen today?",
    queenPromptLabel: 'Tap to reveal the only right answer',
    queenAnswer: 'Obviously Baybooo!',
    queenNote: 'Crown status: permanently reserved for you.',
    complimentButtonLabel: 'Tap for a little compliment',

    compliments: [
      "You're one of a kind.",
      'Your smile makes everything better.',
      'Never change the beautiful person you are.',
      'You deserve all the happiness.',
      'Being around you makes ordinary days feel effortless.',
      'Your kindness leaves a quiet sparkle everywhere you go.',
    ],

    secretButtonLabel: 'One more surprise?',
    secretTitle: 'Just between us, Baybo',

    secretMessage:
      'No matter how busy life gets or how fast the years move, you will always have someone in your corner celebrating every win, every laugh, and every single chapter ahead of you. Thank you for being you.',

    continueLabel: 'Open Final Surprise',
  },

  finalSurprise: {
    kicker: 'Chapter 04 · For the year ahead',
    headline: 'Happy Birthday Once Again, Baybooo! ❤️',
    message:
      'May this new chapter bring you endless happiness, beautiful memories, and countless reasons to smile.',
    buttonLabel: 'Leave Me Your Feedback 💌',
  },

  feedback: {
    apiUrl:
      'https://script.google.com/macros/s/AKfycbwA_UIImBh_HSjgBAqoLYjgYW-ttEAT16_6c_x7bqm6D-5RrNw9qyqkR3MWE7FBaPkGcQ/exec',

    kicker: 'Chapter 05 · Tell me how it felt',
    title: 'A Quick Note Back 💌',
    subtitle: 'Your note goes straight to my private birthday keepsake sheet.',
    placeholder: 'So Baybooo, how was your little surprise? 💗',
    smileQuestion: 'Did this surprise make you smile?',
    smileOptions: ['Yes 💗', 'Of course! ✨', 'Definitely! 🎀'] as const,
    submitLabel: 'Send My Feedback 💌',
    successTitle: 'Your feedback made my day too! ❤️',
    successMessage: 'Thank you for opening your surprise, Baybo. Happy birthday again!',
  },

  music: {
    enabled: true,
    trackTitle: 'Birthday Music Box',
    audioSrc: '/music/birthday-melody.mp3',
  },
};
