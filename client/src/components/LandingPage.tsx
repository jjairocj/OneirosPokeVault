import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import tcgdex from '../lib/tcgdex';

interface LandingPageProps {
  onGetStarted: () => void;
}

// Demo card data (static so it loads instantly)
const DEMO_CARDS = [
  { name: 'Charizard', id: 'base1-4', owned: true },
  { name: 'Pikachu', id: 'base1-58', owned: true },
  { name: 'Mewtwo', id: 'base1-10', owned: false },
  { name: 'Blastoise', id: 'base1-2', owned: true },
  { name: 'Gengar', id: 'base1-94', owned: false },
  { name: 'Eevee', id: 'base1-51', owned: true },
];

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const { t } = useLanguage();
  const [totalSets, setTotalSets] = useState(200);

  useEffect(() => {
    tcgdex.set.list().then((sets) => {
      if (sets) setTotalSets(sets.length);
    }).catch(() => {});
  }, []);

  const demoOwned = DEMO_CARDS.filter((c) => c.owned).length;
  const demoPercent = Math.round((demoOwned / DEMO_CARDS.length) * 100);

  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-12 sm:pt-24 sm:pb-20 text-center relative">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-purple-300">{totalSets}+ {t('landing.setsAvailable')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-purple-300 to-purple-500 bg-clip-text text-transparent">
              {t('landing.heroTitle')}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t('landing.heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onGetStarted}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              {t('landing.cta')}
            </button>
            <span className="text-sm text-gray-500">{t('landing.free')}</span>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 sm:p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="text-xs text-gray-600">oneiros-pokevault.com</span>
          </div>

          {/* Fake tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            <span className="bg-vault-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap">
              Base Set <span className="opacity-70">{demoOwned}/{DEMO_CARDS.length}</span>
            </span>
            <span className="bg-gray-800 text-gray-400 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap">
              Ascended Heroes <span className="opacity-70">0/295</span>
            </span>
            <span className="bg-gray-800 text-gray-400 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap">
              Pikachu <span className="opacity-70">12/89</span>
            </span>
          </div>

          {/* Fake progress bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-vault-500 to-vault-400 rounded-full"
                style={{ width: `${demoPercent}%` }}
              />
            </div>
            <span className="text-xs text-gray-400">
              {demoOwned}/{DEMO_CARDS.length} ({demoPercent}%)
            </span>
          </div>

          {/* Demo cards grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {DEMO_CARDS.map((card) => (
              <div
                key={card.id}
                className={`relative rounded-lg overflow-hidden aspect-[2.5/3.5] bg-gray-800 ${
                  card.owned ? 'ring-2 ring-vault-500 shadow-md shadow-vault-500/20' : ''
                }`}
              >
                <div className={`w-full h-full flex items-center justify-center ${
                  card.owned ? '' : 'grayscale brightness-[0.4]'
                }`}>
                  <div className="text-center p-1">
                    <div className="text-2xl sm:text-3xl mb-1 opacity-60">
                      {card.name === 'Charizard' && '\u{1F525}'}
                      {card.name === 'Pikachu' && '\u{26A1}'}
                      {card.name === 'Mewtwo' && '\u{1F52E}'}
                      {card.name === 'Blastoise' && '\u{1F4A7}'}
                      {card.name === 'Gengar' && '\u{1F47B}'}
                      {card.name === 'Eevee' && '\u{2B50}'}
                    </div>
                    <p className="text-[8px] sm:text-[10px] text-gray-400 font-medium">{card.name}</p>
                  </div>
                </div>
                {card.owned && (
                  <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-bold">
                    &#10003;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
          {t('landing.featuresTitle')}
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: '\u{1F50D}', title: t('landing.f1Title'), desc: t('landing.f1Desc') },
            { icon: '\u{1F4E6}', title: t('landing.f2Title'), desc: t('landing.f2Desc') },
            { icon: '\u{1F4CA}', title: t('landing.f3Title'), desc: t('landing.f3Desc') },
            { icon: '\u{1F3AE}', title: t('landing.f4Title'), desc: t('landing.f4Desc') },
            { icon: '\u{1F310}', title: t('landing.f5Title'), desc: t('landing.f5Desc') },
            { icon: '\u{1F4F1}', title: t('landing.f6Title'), desc: t('landing.f6Desc') },
          ].map((f) => (
            <div key={f.title} className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 hover:border-purple-500/30 transition-colors">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-100 mb-1.5">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
          {t('landing.pricingTitle')}
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Free */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-1">{t('landing.freePlan')}</h3>
            <p className="text-3xl font-extrabold mb-4">$0 <span className="text-sm font-normal text-gray-500">/ {t('landing.forever')}</span></p>
            <ul className="space-y-2 text-sm text-gray-300 mb-6">
              <li className="flex items-center gap-2"><span className="text-green-400">&#10003;</span> {t('landing.freeF1')}</li>
              <li className="flex items-center gap-2"><span className="text-green-400">&#10003;</span> {t('landing.freeF2')}</li>
              <li className="flex items-center gap-2"><span className="text-green-400">&#10003;</span> {t('landing.freeF3')}</li>
            </ul>
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              {t('landing.cta')}
            </button>
          </div>

          {/* Pro */}
          <div className="bg-gray-900/60 border-2 border-amber-500/40 rounded-xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              PRO
            </div>
            <h3 className="text-lg font-bold mb-1 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">{t('landing.proPlan')}</h3>
            <p className="text-3xl font-extrabold mb-4">{t('landing.proPrice')} <span className="text-sm font-normal text-gray-500">/ {t('landing.month')}</span></p>
            <ul className="space-y-2 text-sm text-gray-300 mb-6">
              <li className="flex items-center gap-2"><span className="text-green-400">&#10003;</span> {t('landing.proF1')}</li>
              <li className="flex items-center gap-2"><span className="text-green-400">&#10003;</span> {t('landing.proF2')}</li>
              <li className="flex items-center gap-2"><span className="text-green-400">&#10003;</span> {t('landing.proF3')}</li>
            </ul>
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-2.5 rounded-lg font-bold transition-all"
            >
              {t('landing.proCta')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo.svg" alt="Oneiros PokeVault" className="w-6 h-6" />
          <span className="text-sm font-semibold text-gray-400">Oneiros PokeVault</span>
        </div>
        <p className="text-xs text-gray-600">{t('landing.footer')}</p>
      </footer>
    </div>
  );
}
