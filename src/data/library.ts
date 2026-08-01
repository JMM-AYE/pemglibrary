import heroAuditorium from "@/assets/hero-auditorium.jpg";
import seriesWord from "@/assets/series-word.jpg";
import seriesVoice from "@/assets/series-voice.jpg";
import seriesDawn from "@/assets/series-dawn.jpg";
import articleStudy from "@/assets/article-study.jpg";
import articlePrayer from "@/assets/article-prayer.jpg";

export const covers = {
  heroAuditorium,
  seriesWord,
  seriesVoice,
  seriesDawn,
  articleStudy,
  articlePrayer,
};

/**
 * Demo stream sources. Swap `video` with the real message stream (HLS, MP4 or
 * an embed URL) when the library feed is connected.
 */
const DEMO_STREAM =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4";

export type Message = {
  slug: string;
  title: string;
  series: string;
  part: string;
  duration: string;
  date: string;
  language: string;
  scripture: string;
  cover: string;
  video: string;
  summary: string;
  notes: string[];
};

export const messages: Message[] = [
  {
    slug: "7-facts-of-the-higher-life",
    title: "7 Facts of the Higher Life",
    series: "The Higher Life",
    part: "Part 1 of 7",
    duration: "48 min",
    date: "2026-06-14",
    language: "English",
    scripture: "Colossians 3:1-4",
    cover: seriesDawn,
    video: DEMO_STREAM,
    summary:
      "The life you received in Christ is not an improved version of the old one. It is a different order of life entirely, lived from above and untouched by the systems of this world.",
    notes: [
      "You were not saved to cope; you were raised to reign.",
      "The higher life is a location before it is a lifestyle.",
      "Your consciousness determines your experience of the life you already have.",
    ],
  },
  {
    slug: "7-factors-for-spiritual-advancement",
    title: "7 Factors for Spiritual Advancement",
    series: "Advancement",
    part: "Part 1 of 7",
    duration: "56 min",
    date: "2026-05-30",
    language: "English",
    scripture: "2 Peter 1:5-8",
    cover: seriesWord,
    video: DEMO_STREAM,
    summary:
      "Spiritual growth is never accidental. There are deliberate factors that move a believer from milk to meat, from stagnation to visible advancement.",
    notes: [
      "Advancement follows attention. What you give yourself to, grows.",
      "The Word is the only legitimate diet for the human spirit.",
      "Fellowship is a growth mechanism, not a social obligation.",
    ],
  },
  {
    slug: "the-power-of-your-words",
    title: "The Power of Your Words",
    series: "Words & Worlds",
    part: "Part 3 of 5",
    duration: "41 min",
    date: "2026-05-11",
    language: "English",
    scripture: "Proverbs 18:21",
    cover: seriesVoice,
    video: DEMO_STREAM,
    summary:
      "Words are containers. They carry either faith or fear, and the world you live in tomorrow is being framed by the sentences you speak today.",
    notes: [
      "You are not describing your life; you are dictating it.",
      "Faith is voice-activated.",
      "Refuse to narrate a defeat God never authored.",
    ],
  },
  {
    slug: "praying-with-understanding",
    title: "Praying with Understanding",
    series: "The Praying Church",
    part: "Part 2 of 4",
    duration: "37 min",
    date: "2026-04-26",
    language: "English",
    scripture: "Ephesians 1:17-19",
    cover: articlePrayer,
    video: DEMO_STREAM,
    summary:
      "Prayer is not an appeal to a reluctant God. It is a legislative act, carried out by someone who understands what has already been given.",
    notes: [
      "Effective prayer begins with revealed knowledge.",
      "Pray the answer, not the problem.",
      "Intercession is stewardship of authority.",
    ],
  },
  {
    slug: "the-ministry-of-the-word",
    title: "The Ministry of the Word",
    series: "Foundations",
    part: "Part 1 of 3",
    duration: "52 min",
    date: "2026-04-05",
    language: "English",
    scripture: "Acts 6:4",
    cover: articleStudy,
    video: DEMO_STREAM,
    summary:
      "Everything God does among His people, He does through His Word. Give the Word first place and every other thing arranges itself around it.",
    notes: [
      "The Word is God speaking to you now, not a record of an old conversation.",
      "Study is worship with a pen in hand.",
      "What you meditate on, you eventually manifest.",
    ],
  },
  {
    slug: "living-in-the-consciousness-of-glory",
    title: "Living in the Consciousness of Glory",
    series: "The Higher Life",
    part: "Part 4 of 7",
    duration: "45 min",
    date: "2026-03-22",
    language: "English",
    scripture: "2 Corinthians 3:18",
    cover: covers.heroAuditorium,
    video: DEMO_STREAM,
    summary:
      "Glory is not a feeling that visits on Sundays. It is the atmosphere of the reborn spirit, and consciousness is how you keep it switched on.",
    notes: [
      "You do not chase glory; you carry it.",
      "Consciousness is cultivated in the mirror of the Word.",
      "Transformation happens by beholding, not by striving.",
    ],
  },
];

export type Article = {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  cover: string;
  excerpt: string;
  body: string[];
  source: "Rhapsody of Realities" | "Healing Streams";
  sourceUrl: string;
  scripture?: string;
  confession?: string;
};

export const articles: Article[] = [
  {
    slug: "how-to-study-the-word-daily",
    title: "How to Study the Word Daily Without Burning Out",
    category: "Study",
    readTime: "6 min read",
    date: "2026-06-20",
    cover: articleStudy,
    excerpt:
      "A sustainable rhythm beats an ambitious plan you abandon in week two. Here is a simple structure for daily study that compounds.",
    body: [
      "Most people do not quit studying the Word because it is boring. They quit because they built a plan for a version of themselves that does not exist yet.",
      "Start with one passage, not one book. Read it slowly, twice. The second reading is where the questions arrive, and questions are the doorway to revelation.",
      "Write one sentence. Not a summary of the chapter, a single sentence about what the passage says is true of you now. That sentence is what you carry into the day.",
      "Then speak it. Meditation without articulation stays theoretical. Say it aloud until it stops sounding like information and starts sounding like identity.",
      "Consistency is the multiplier. Fifteen honest minutes every day will take you further in a year than three intense hours every other month.",
    ],
  },
  {
    slug: "prayer-that-changes-atmospheres",
    title: "Prayer That Changes Atmospheres",
    category: "Prayer",
    readTime: "5 min read",
    date: "2026-06-06",
    cover: articlePrayer,
    excerpt:
      "Why the posture you bring into prayer matters more than the length of time you spend there.",
    body: [
      "There is a kind of prayer that reports the problem to God, and a kind that enforces what God has already said. They sound similar. They produce very different results.",
      "The first is honest but circular. The second is anchored: it opens with what is written, and everything after is agreement with that.",
      "Atmospheres shift when believers pray from a settled place. Desperation is loud; authority is calm. You can hear the difference in a room.",
      "Give your prayer a scripture spine. Take one verse into the place of prayer and let it shape every sentence you pray.",
      "Then stay long enough to hear. Prayer that never pauses is a monologue, and monologues rarely change anything.",
    ],
  },
  {
    slug: "the-language-of-faith",
    title: "The Language of Faith",
    category: "Faith",
    readTime: "4 min read",
    date: "2026-05-18",
    cover: seriesVoice,
    excerpt:
      "Faith has a vocabulary. Learn it, and you stop unconsciously arguing against the very thing you are believing for.",
    body: [
      "Language is not decoration on top of belief. It is the mechanism by which belief becomes visible.",
      "Notice the small concessions: 'I'm trying to believe', 'maybe it will work out'. These are not humility, they are hedges.",
      "Faith speaks in the present tense about what God has already settled, and in the future tense about what it expects to see.",
      "Change the sentences and you change the direction. Not because words are magic, but because words are the steering column of a life.",
    ],
  },
  {
    slug: "walking-in-the-higher-life",
    title: "Walking in the Higher Life",
    category: "Growth",
    readTime: "7 min read",
    date: "2026-04-30",
    cover: seriesDawn,
    excerpt:
      "A practical companion to the series: what the higher life looks like on an ordinary Tuesday.",
    body: [
      "The higher life is often described in lofty terms, which is exactly why it can feel unreachable. But it is lived in ordinary hours.",
      "It looks like refusing to be defined by a diagnosis, a market, or a message you did not want to receive.",
      "It looks like responding rather than reacting, because your peace is not sourced in your circumstances.",
      "It looks like generosity that makes no financial sense to anyone watching, and confidence that makes no sense either.",
      "None of this is performance. It is the natural behaviour of someone who knows what kind of life they were given.",
    ],
  },
];

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}