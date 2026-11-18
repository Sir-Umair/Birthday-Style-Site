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
    /**
     * Place your own MP3 file in `public/music/birthday-melody.mp3`
     * and set audioSrc to "/music/birthday-melody.mp3".
     * If no audio file is found, a gentle built-in music-box chime plays instead.
     */
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
      'Dear Baybo,',
      "I don't know how to make the perfect birthday gift, but I wanted to create something a little different for you.",
      'I hope your day is filled with happiness, laughter, beautiful moments, and everything your heart wishes for.',
      'Keep smiling, keep being yourself, and never stop shining.',
      'Once again, happiest birthday, Baybo! ❤️',
    ],
    signature: 'Always cheering for you',
    continueLabel: 'See Little Memories',
  },

  memories: {
    kicker: 'Chapter 03 · Keepsake moments',
    title: 'Little Memories 📸',
    subtitle: 'Swipe through and tap any frame for a closer look. Replace these anytime with our favorite snapshots.',
    photos: [
      {
        id: 'memory-1',
        src: '/src/assets/images/memory_sunset_picnic_1794972235737.jpg',
        alt: 'Golden hour picnic with iced lattes, strawberries, peonies, and laughter',
        caption: 'Golden hour talks, iced lattes, and the kind of laughs that make hours feel like minutes.',
        momentLabel: '01 · Golden Hour',
      },
      {
        id: 'memory-2',
        src: '/src/assets/images/memory_coffee_table_1794972236079.jpg',
        alt: 'Sunlit cafe table with two lattes and a berry cake slice',
        caption: 'Two cups, something sweet on the side, and catching up on absolutely everything.',
        momentLabel: '02 · Coffee Catch-Ups',
      },
      {
        id: 'memory-3',
        src: '/src/assets/images/memory_birthday_sparklers_1794972255455.jpg',
        alt: 'Glowing golden sparklers against a twilight lavender sky',
        caption: 'Wishing you a year that shines just as brightly as you make everyone else’s days.',
        momentLabel: '03 · Sparkle Season',
      },
      {
        id: 'memory-4',
        src: '/src/assets/images/memory_flower_bouquet_1794972237140.jpg',
        alt: 'Hand-tied blush pink ranunculus and lavender bouquet wrapped in linen',
        caption: 'Soft pinks, lavender, and all the little beautiful things you deserve today.',
        momentLabel: '04 · Fresh Blooms',
      },
      {
        id: 'memory-5',
        src: '/src/assets/images/memory_coastal_dusk_1794972237892.jpg',
        alt: 'Pastel rose and lavender sunset reflecting on ocean waves',
        caption: 'Quiet evenings, pastel skies, and moments that feel calm just because you’re there.',
        momentLabel: '05 · Pastel Skies',
      },
      {
        id: 'memory-6',
        src: '/src/assets/images/memory_wax_envelope_1794972255355.jpg',
        alt: 'Handmade cream envelope with a blush pink wax seal beside a teacup',
        caption: 'A small reminder saved forever: life is simply warmer with you in it, Baybo.',
        momentLabel: '06 · Saved Forever',
      },
    ],
    continueLabel: 'Visit the Fun Zone',
  },

  funZone: {
    kicker: 'Chapter 04 · Play a little',
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
    kicker: 'Chapter 05 · For the year ahead',
    headline: 'Happy Birthday Once Again, Baybooo! ❤️',
    message:
      'May this new chapter bring you endless happiness, beautiful memories, and countless reasons to smile.',
    buttonLabel: 'Leave Me Your Feedback 💌',
  },

  feedback: {
    apiUrl:
      'https://script.google.com/macros/s/AKfycbwA_UIImBh_HSjgBAqoLYjgYW-ttEAT16_6c_x7bqm6D-5RrNw9qyqkR3MWE7FBaPkGcQ/exec',
    kicker: 'Chapter 06 · Tell me how it felt',
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
