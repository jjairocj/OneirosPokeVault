import { useState } from 'react';
import { usePayments, PLAN_INFO, PlanKey } from '../hooks/usePayments';
import { useAuth } from '../hooks/useAuth';
import AppShell from '../components/AppShell';

const PRO_FEATURES = [
  'Deck Builder (decks ilimitados)',
  'MasterDex — seguimiento completo',
  'Custom Lists (wishlist, trade binder…)',
  'Price Trends con sparklines',
  'Binder View — álbum visual',
  'Notas por carta',
  'Perfil público con cartas destacadas',
  'Exportar/importar PTCGLive',
];

type Currency = 'COP' | 'USD';

export default function Pricing() {
  const { user } = useAuth();
  const { loading, error, initiate } = usePayments();
  const [currency, setCurrency] = useState<Currency>('COP');
  const [redirecting, setRedirecting] = useState<PlanKey | null>(null);

  async function handleSubscribe(plan: PlanKey) {
    setRedirecting(plan);
    const result = await initiate(plan);
    if (result?.checkoutUrl) window.location.href = result.checkoutUrl;
    setRedirecting(null);
  }

  const monthlyPlan: PlanKey = currency === 'COP' ? 'pro_monthly_cop' : 'pro_monthly_usd';
  const yearlyPlan: PlanKey = currency === 'COP' ? 'pro_yearly_cop' : 'pro_yearly_usd';

  const topBar = <span className="text-sm font-semibold text-gray-200">🚀 Go Pro</span>;

  if (user?.plan === 'pro' || user?.role === 'admin') {
    return (
      <AppShell topBar={topBar}>
        <div className="flex items-center justify-center h-64 text-center">
          <div>
            <div className="text-5xl mb-4">⭐</div>
            <h1 className="text-2xl font-bold mb-2 text-white">Ya tienes Pro</h1>
            <p className="text-gray-400">Disfruta de todas las funcionalidades premium.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell topBar={topBar}>
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Hazte Pro</h1>
          <p className="text-gray-400">Desbloquea todas las herramientas para tu colección</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            {(['COP', 'USD'] as Currency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${currency === c ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="bg-red-900 text-red-300 rounded p-3 text-sm mb-6 text-center">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {([monthlyPlan, yearlyPlan] as PlanKey[]).map((plan) => {
            const info = PLAN_INFO[plan];
            const isYearly = plan.includes('yearly');
            return (
              <div key={plan} className={`rounded-2xl border p-6 flex flex-col ${isYearly ? 'border-purple-500 bg-purple-950/30' : 'border-gray-700 bg-gray-800'}`}>
                {isYearly && info.savings && (
                  <span className="self-start bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full mb-3 font-medium">{info.savings}</span>
                )}
                <h2 className="text-lg font-bold text-white mb-1">{info.label}</h2>
                <div className="text-3xl font-bold text-white mb-1">
                  {info.price} <span className="text-base font-normal text-gray-400">/ {info.period}</span>
                </div>
                <p className="text-xs text-gray-500 mb-5">via {info.provider}</p>
                <button
                  type="button"
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading || redirecting !== null}
                  className={`mt-auto py-2.5 rounded-lg font-semibold text-sm transition-colors ${isYearly ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'} disabled:opacity-50`}
                >
                  {redirecting === plan ? 'Redirigiendo...' : 'Suscribirse'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-800 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-200 mb-4">Todo incluido en Pro</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-green-400 mt-0.5">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Pagos procesados por Bold (PSE/Colombia) o Stripe. No almacenamos datos de tarjeta.
        </p>
      </div>
    </AppShell>
  );
}
