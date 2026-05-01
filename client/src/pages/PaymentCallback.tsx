import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePayments } from '../hooks/usePayments';
import { useAuth } from '../hooks/useAuth';
import AppShell from '../components/AppShell';

export default function PaymentCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { checkStatus } = usePayments();
  const { refresh } = useAuth();
  const [status, setStatus] = useState<'checking' | 'completed' | 'failed' | 'pending'>('checking');

  const paymentId = params.get('paymentId');
  const result = params.get('result');

  useEffect(() => {
    async function check() {
      if (result === 'cancel') { setStatus('failed'); return; }
      if (!paymentId) { setStatus('failed'); return; }
      const payment = await checkStatus(parseInt(paymentId, 10));
      if (payment?.status === 'completed') {
        await refresh();
        setStatus('completed');
      } else {
        setStatus(payment?.status === 'failed' ? 'failed' : 'pending');
      }
    }
    check();
  }, [paymentId, result, checkStatus, refresh]);

  const topBar = <span className="text-sm font-semibold text-gray-200">Payment</span>;

  return (
    <AppShell topBar={topBar}>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm px-6">
          {status === 'checking' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-400">Verificando pago...</p>
            </>
          )}
          {status === 'completed' && (
            <>
              <div className="text-5xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold text-white mb-2">¡Bienvenido a Pro!</h1>
              <p className="text-gray-400 mb-6">Tu cuenta ha sido actualizada.</p>
              <button type="button" onClick={() => navigate('/')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
                Ir al inicio
              </button>
            </>
          )}
          {status === 'pending' && (
            <>
              <div className="text-5xl mb-4">⏳</div>
              <h1 className="text-xl font-bold text-white mb-2">Pago en proceso</h1>
              <p className="text-gray-400 mb-6">Tu pago está siendo procesado. Te notificaremos cuando se confirme.</p>
              <button type="button" onClick={() => navigate('/')} className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg">
                Volver al inicio
              </button>
            </>
          )}
          {status === 'failed' && (
            <>
              <div className="text-5xl mb-4">❌</div>
              <h1 className="text-xl font-bold text-white mb-2">Pago no completado</h1>
              <p className="text-gray-400 mb-6">El pago fue cancelado o falló. Puedes intentarlo de nuevo.</p>
              <button type="button" onClick={() => navigate('/pricing')} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg">
                Intentar de nuevo
              </button>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
