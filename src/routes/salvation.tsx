import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Reveal } from "@/components/reveal";
import { devotionalsQueryOptions, formatDevotionalDate } from "@/lib/devotionals";

const TITLE = "Salvation — PEMG Library";
const DESCRIPTION =
  "Say the prayer of salvation and be born again, then listen to today's Rhapsody of Realities audio devotional and take your first steps as a new creation.";

export const Route = createFileRoute("/salvation")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(devotionalsQueryOptions),
  component: SalvationPage,
});

const STEPS = [
  {
    title: "Get a Bible and read it daily",
    body: "Start with the Gospel of John. The Word is the food of your new life; give it time every single day.",
  },
  {
    title: "Talk to God in prayer",
    body: "Prayer is fellowship, not a formality. Speak to your Father freely, and thank Him for the life He has given you.",
  },
  {
    title: "Join a church family",
    body: "You were born into a family. Find a Bible-believing church, and let others walk with you as you grow.",
  },
  {
    title: "Tell someone",
    body: "Share what has happened to you. Your testimony settles it in your own heart and opens the door for someone else.",
  },
];

const SCRIPTURES = [
  {
    ref: "Romans 10:9-10",
    text: "That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.",
  },
  {
    ref: "2 Corinthians 5:17",
    text: "Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.",
  },
  {
    ref: "John 1:12",
    text: "But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name.",
  },
];

function SalvationPage() {
  const { data: devotionals } = useSuspenseQuery(devotionalsQueryOptions);
  const today = devotionals[0];

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-36 sm:px-8">
      <p className="eyebrow-cool">New beginning</p>
      <h1 className="display mt-4 text-[clamp(2.75rem,8vw,6rem)]">Salvation</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{DESCRIPTION}</p>

      <Reveal>
        <section className="mt-12 rounded-[2rem] border border-[color:color-mix(in_oklab,var(--sage)_22%,transparent)] bg-[color:color-mix(in_oklab,var(--ink)_88%,var(--background))] p-7 sm:p-10">
          <p className="eyebrow-cool">Say this out loud</p>
          <h2 className="display mt-4 text-3xl sm:text-4xl">The prayer of salvation</h2>
          <blockquote className="mt-6 space-y-4 text-lg leading-relaxed text-foreground">
            <p>
              O Lord God, I believe with all my heart in Jesus Christ, Son of the living God. I
              believe He died for me and God raised Him from the dead.
            </p>
            <p>
              I believe He is alive today. I confess with my mouth that Jesus Christ is the Lord
              of my life from this day. Through Him and in His Name, I have eternal life; I am
              born again.
            </p>
            <p>Thank you Lord for saving my soul! I am now a child of God. Hallelujah!</p>
          </blockquote>
          <p className="mt-7 text-sm text-muted-foreground">
            If you prayed that prayer, you are born again — a brand new person in Christ. Welcome
            to the family.
          </p>
        </section>
      </Reveal>

      <section className="mt-14">
        <p className="eyebrow-cool">What the Word says</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {SCRIPTURES.map((s, i) => (
            <Reveal key={s.ref} delay={i * 70}>
              <div className="h-full rounded-3xl border border-border p-6">
                <p className="font-display text-sm font-bold uppercase tracking-wider text-primary">
                  {s.ref}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {today && (
        <Reveal>
          <section className="mt-14 rounded-[2rem] border border-border bg-surface p-7 sm:p-9">
            <p className="eyebrow-cool">
              Rhapsody of Realities &middot; {formatDevotionalDate(today.date)}
            </p>
            <h2 className="display mt-3 text-2xl sm:text-3xl">{today.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{today.excerpt}</p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Listen to today&apos;s audio devotional
            </p>
            <audio controls preload="none" src={today.audioUrl} className="mt-3 w-full">
              Your browser does not support audio playback.
            </audio>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/articles/$slug"
                params={{ slug: today.slug }}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Read today&apos;s devotional
              </Link>
              <Link
                to="/articles"
                className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                All devotionals
              </Link>
            </div>
          </section>
        </Reveal>
      )}

      <section className="mt-14">
        <p className="eyebrow-cool">Your next steps</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 70}>
              <div className="h-full rounded-3xl border border-border p-6">
                <p className="font-display text-lg font-bold uppercase leading-snug">
                  {step.title}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-[2rem] border border-border p-7 text-center sm:p-9">
        <h2 className="display text-2xl sm:text-3xl">Keep growing with us</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          Watch the messages, join a live service and let the Word settle the new life you have
          received.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/messages"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Watch messages
          </Link>
          <Link
            to="/live"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Live services
          </Link>
        </div>
      </section>
    </div>
  );
}
