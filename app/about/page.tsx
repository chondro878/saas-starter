import Image from 'next/image';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const inspirationSlides = [
  {
    title: "Gentleman's Gazette",
    description: 'Classic menswear, etiquette, and proof that small details make people feel seen.',
    href: 'https://www.gentlemansgazette.com'
  },
  {
    title: 'The School of Life',
    description: 'Emotional intelligence lessons that keep us grounded, open-hearted, and curious.',
    href: 'https://www.theschooloflife.com'
  },
  {
    title: 'The Marginalian',
    description: 'Maria Popova’s reflections remind us to stay kind, thoughtful, and awake to wonder.',
    href: 'https://www.themarginalian.org'
  },
  {
    title: 'Kindness.org',
    description: 'Research-backed ideas showing that small, compassionate habits change communities.',
    href: 'https://www.kindness.org'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen relative overflow-hidden text-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-300">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100 via-transparent to-transparent opacity-60" />
      </div>

      <div className="relative mx-auto flex max-w-4xl flex-col gap-12 px-6 py-16 sm:py-20">
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/40 shadow-2xl backdrop-blur">
          <Image
            src="/US.jpg"
            alt="Julian and Jess, founders of Avoid the Rain"
            width={1600}
            height={1067}
            priority
            className="h-full w-full object-cover"
          />
        </div>

        <div className="space-y-6 rounded-3xl border border-white/60 bg-white/70 p-8 shadow-2xl backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">About Avoid the Rain</p>
          <h1 className="text-4xl font-semibold leading-tight">
            We&apos;re Julian and Jess—Avoid the Rain is our love letter to staying close.
          </h1>
          <p className="text-lg leading-relaxed text-slate-700">
            We live in Seattle, run Avoid the Rain from our apartment, and split our time between writing code, licking stamps, and making
            sure the people we adore never go too long without hearing from us. This is one of several small businesses we&apos;re building
            together—all centered around relationships, rituals, and being the kindest versions of ourselves.
          </p>
          <p className="text-lg leading-relaxed text-slate-700">
            We&apos;re not backed by a giant corporation or a pile of investor cash. It&apos;s just us (and a very opinionated dog) doing
            the work because we believe thoughtfulness should feel easy, beautiful, and personal. When you email support, you reach one of
            us. When you ship a card, we celebrate with you. When something goes wrong, we fix it ourselves.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/create-reminder"
              className="inline-flex items-center justify-center rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
            >
              Plan a Reminder
            </Link>
            <a
              href="mailto:support@avoidtherain.com"
              className="inline-flex items-center justify-center rounded-full border border-white/60 bg-white/60 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
            >
              Say Hello
            </a>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/60 bg-white/70 p-8 shadow-2xl backdrop-blur">
          <h2 className="text-2xl font-semibold">What &amp; Who Inspires Us</h2>
          <p className="text-slate-700">
            We take cues from people and projects that champion kindness, curiosity, and timeless care. Spin through a few of our go-tos.
          </p>

          <div className="relative">
            <Carousel className="w-full" opts={{ align: 'start', loop: true }}>
              <CarouselContent>
                {inspirationSlides.map((slide) => (
                  <CarouselItem key={slide.href} className="md:basis-1/2">
                    <a
                      href={slide.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full rounded-2xl border border-white/70 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:border-purple-200 hover:bg-white hover:shadow-lg"
                    >
                      <h3 className="text-lg font-semibold text-slate-900">{slide.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{slide.description}</p>
                      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-purple-600">
                        Visit site
                        <span aria-hidden>→</span>
                      </span>
                    </a>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-10 hidden sm:flex" />
              <CarouselNext className="-right-10 hidden sm:flex" />
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
}

