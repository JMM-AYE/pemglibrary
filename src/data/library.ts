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
    slug: "rhapsody-the-word-is-your-life",
    title: "The Word Is Your Life",
    category: "Daily Devotional",
    source: "Rhapsody of Realities",
    sourceUrl: "https://rhapsodyofrealities.org/",
    scripture:
      "For they are life unto those that find them, and health to all their flesh (Proverbs 4:22).",
    confession:
      "The Word of God is at work in me, producing life, health and strength in every fibre of my being. I am what the Word says I am.",
    readTime: "4 min read",
    date: "2026-07-30",
    cover: articleStudy,
    excerpt:
      "God's Word is not information about life; it is the substance of life itself, delivered to your spirit in words you can receive.",
    body: [
      "There is a difference between reading the Word for knowledge and receiving the Word as life. The first fills the mind. The second reorganises the man.",
      "Jesus said the words He speaks are spirit and they are life. That means every verse you take into your spirit carries the very energy of God's own life into your body, your mind and your circumstances.",
      "This is why the devotional habit matters. You are not ticking a box each morning; you are feeding on the substance that produces health in your flesh and clarity in your decisions.",
      "So do not merely read today's portion. Take one line, meditate on it through the day, and say it until it stops sounding like a quotation and starts sounding like your own testimony.",
    ],
  },
  {
    slug: "rhapsody-your-words-frame-your-world",
    title: "Your Words Frame Your World",
    category: "Daily Devotional",
    source: "Rhapsody of Realities",
    sourceUrl: "https://rhapsodyofrealities.org/",
    scripture:
      "Death and life are in the power of the tongue: and they that love it shall eat the fruit thereof (Proverbs 18:21).",
    confession:
      "My words are spirit and they are life. I speak only what God has said concerning me, and my world conforms to His Word.",
    readTime: "4 min read",
    date: "2026-07-24",
    cover: seriesVoice,
    excerpt:
      "You are not describing the life you have; with every sentence you are dictating the life you are about to have.",
    body: [
      "God framed the worlds by His Word, and He has given the same creative principle to the man made in His image.",
      "Faith is voice-activated. What you believe in your heart becomes operational in your world at the point where you open your mouth and say it.",
      "Watch the small concessions: 'I'm trying to believe', 'maybe it will work out'. They are not humility; they are hedges that quietly dismantle the very thing you are believing for.",
      "Take the verse of the day into your mouth. Speak it in the present tense, with the confidence of someone reporting a settled matter, because in the mind of God it is settled.",
    ],
  },
  {
    slug: "rhapsody-praying-with-understanding",
    title: "Praying With Understanding",
    category: "Daily Devotional",
    source: "Rhapsody of Realities",
    sourceUrl: "https://rhapsodyofrealities.org/",
    scripture:
      "That the God of our Lord Jesus Christ, the Father of glory, may give unto you the spirit of wisdom and revelation in the knowledge of him (Ephesians 1:17).",
    confession:
      "I pray from a place of knowledge, not desperation. The eyes of my understanding are enlightened, and my prayers are effective and full of power.",
    readTime: "5 min read",
    date: "2026-07-18",
    cover: articlePrayer,
    excerpt:
      "Prayer is not an appeal to a reluctant God. It is a legislative act carried out by someone who knows what has already been given.",
    body: [
      "There is a kind of prayer that reports the problem to God, and a kind that enforces what God has already said. They sound similar, and they produce very different results.",
      "The first is honest but circular. The second is anchored: it opens with what is written, and every sentence after it is agreement with that.",
      "Atmospheres shift when believers pray from a settled place. Desperation is loud; authority is calm. You can hear the difference in a room.",
      "Give your prayer a scripture spine today. Take one verse into the place of prayer and let it shape everything you say — then stay long enough to hear.",
    ],
  },
  {
    slug: "healing-streams-healing-is-the-children-s-bread",
    title: "Healing Is the Children's Bread",
    category: "Healing",
    source: "Healing Streams",
    sourceUrl: "https://www.healingstreams.tv/",
    scripture:
      "Himself took our infirmities, and bare our sicknesses (Matthew 8:17).",
    readTime: "5 min read",
    date: "2026-07-12",
    cover: covers.heroAuditorium,
    excerpt:
      "Healing is not a special favour reserved for the deserving. It is provision already purchased and already delivered to the family of God.",
    body: [
      "At the Healing Streams Live Healing Services, testimonies pour in from every continent — and the common thread is never how spiritual the person was. It is what they came to know.",
      "Sickness has no legal right in the body of a believer. When Jesus bore our infirmities, the transaction was completed; what remains is our reception of it.",
      "That is why the ministration is preceded by teaching. Faith comes by hearing, and the healing is received in the same moment the Word is believed, not at the end of a long negotiation.",
      "If you are believing for healing, stop asking for what you already have and start thanking God for what was finished. Then act on your faith — do what you could not do before.",
    ],
  },
  {
    slug: "healing-streams-preparing-for-a-healing-service",
    title: "How to Prepare for a Live Healing Service",
    category: "Healing",
    source: "Healing Streams",
    sourceUrl: "https://www.healingstreams.tv/",
    scripture:
      "And Jesus said unto him, Go thy way; thy faith hath made thee whole (Mark 10:52).",
    readTime: "6 min read",
    date: "2026-07-05",
    cover: seriesDawn,
    excerpt:
      "A practical guide for hosts and participants: how to set up a viewing centre, invite the sick, and receive with expectation.",
    body: [
      "Preparation is not a formality. Every recorded testimony from a healing service began with somebody deciding, in advance, that they were going to receive.",
      "Set the room. A quiet space, a good screen, a stable connection and seating for the people you have invited — remove every distraction that competes for attention during ministration.",
      "Invite deliberately. Think of the specific people in your street, your workplace and your family who are sick, and go to them personally rather than posting a general announcement.",
      "Prepare the heart. Spend the days before the service in the Word on healing, so that when the man of God ministers, faith is already present and only needs to be released.",
      "Afterwards, follow up. Record the testimonies, keep the new believers connected, and give them the devotional so their healing is sustained by daily fellowship with the Word.",
    ],
  },
  {
    slug: "healing-streams-testimonies-that-build-faith",
    title: "Why Testimonies Build Faith",
    category: "Testimony",
    source: "Healing Streams",
    sourceUrl: "https://www.healingstreams.tv/",
    scripture:
      "And they overcame him by the blood of the Lamb, and by the word of their testimony (Revelation 12:11).",
    readTime: "4 min read",
    date: "2026-06-28",
    cover: seriesWord,
    excerpt:
      "A testimony is not entertainment. It is evidence, and evidence is what turns hope into the confidence that acts.",
    body: [
      "When a man walks out of a wheelchair on camera, something happens in the person watching that a sermon alone does not always accomplish.",
      "The testimony localises the promise. It moves healing from the category of doctrine into the category of things that happen to ordinary people with ordinary names.",
      "That is why we tell them, write them and share them. Every retold testimony is another opportunity for someone's faith to rise to the level where they simply receive.",
      "Do not keep yours private. Report what God has done, in detail, and watch it become the doorway for somebody else.",
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