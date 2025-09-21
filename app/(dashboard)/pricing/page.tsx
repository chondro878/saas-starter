import Link from 'next/link';
import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default function PricingPage() {
  return (
    <>
      {/* Sticky Navbar */}
      <header className="bg-black text-white sticky top-0 z-40 w-full">
        <div className="w-full flex justify-between items-center px-4 py-4">
          <Link href="/" className="text-xl font-[graphik-web-medium]">Avoid the Rain</Link>
        </div>
      </header>

      <main className="bg-black text-white w-full px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-lg text-gray-300">Start by selecting the plan that's right for you.</p>
        </div>
        <div className="w-full flex flex-col md:flex-row justify-center items-center gap-8">
          <PricingCard
            name="Just a Few"
            price={2000}
            interval="year"
            trialDays={0}
            features={[
              '4 cards per year',
              'For the key people and moments',
              'No mental load, just thoughtful touches',
            ]}
            priceId="price_justafew"
          />
          <PricingCard
            name="Stress Free"
            price={4500}
            interval="year"
            trialDays={0}
            features={[
              '10 cards per year',
              'Optional holiday packs',
              'Cards, sent for those special moments',
            ]}
            priceId="price_keepintouch"
          />
          <PricingCard
            name="Social Pros"
            price={9900}
            interval="year"
            trialDays={0}
            features={[
              '20 cards per year',
              'Optional holiday packs',
              'AI-written messages that sound like you',
            ]}
            priceId="price_letushelp"
          />
        </div>
      </main>
    </>
  );
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
}) {
  return (
    <div className="relative pt-6 rounded-xl p-6 shadow-lg flex flex-col justify-between w-full max-w-[350px] bg-[#14171F] text-white border border-transparent hover:border-white transition">
      <h2 className="text-2xl font-medium mb-2">{name}</h2>
      {/* <p className="text-sm mb-4">
        with {trialDays} day free trial
      </p> */}
      <p className="text-5xl font-bold mb-6">
        ${price / 100}
        <span className="text-base font-medium ml-1">yearly</span>
      </p>
      <ul className="space-y-2 mb-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-[#3c7345] mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-white">{feature}</span>
          </li>
        ))}
      </ul>
      {name === "Stress Free" && (
        <div className="absolute bottom-0 left-0 w-full bg-yellow-500 text-black text-xs font-bold uppercase tracking-wide py-2 rounded-b-xl text-center">
          Recommended
        </div>
      )}
    </div>
  );
}
