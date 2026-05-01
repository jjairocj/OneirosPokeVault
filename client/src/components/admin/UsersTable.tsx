import { useLanguage } from '../../hooks/useLanguage';

interface AdminUser {
  id: number;
  email: string;
  plan: string;
  role: string;
  createdAt: string;
}

interface Props {
  users: AdminUser[];
  updating: number | null;
  onTogglePlan: (userId: number, currentPlan: string) => void;
}

export default function UsersTable({ users, updating, onTogglePlan }: Props) {
  const { t } = useLanguage();

  const planBadge = (plan: string) =>
    `text-xs px-2 py-0.5 rounded-full font-medium ${plan === 'pro' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-700 text-gray-300'}`;

  const toggleBtn = (u: AdminUser) =>
    `text-xs px-3 py-1 rounded-md font-medium transition-colors disabled:opacity-50 ${
      u.plan === 'pro' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30'
    }`;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h2 className="font-semibold text-gray-200">{t('admin.users')}</h2>
        <span className="text-sm text-gray-500">{users.length} {t('admin.total')}</span>
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-800">
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">{t('auth.email')}</th>
              <th className="px-4 py-3 font-medium">{t('admin.plan')}</th>
              <th className="px-4 py-3 font-medium">{t('admin.role')}</th>
              <th className="px-4 py-3 font-medium">{t('admin.registered')}</th>
              <th className="px-4 py-3 font-medium">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                <td className="px-4 py-3 text-gray-400">{u.id}</td>
                <td className="px-4 py-3 text-gray-200">{u.email}</td>
                <td className="px-4 py-3"><span className={planBadge(u.plan)}>{u.plan.toUpperCase()}</span></td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-500'}`}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button type="button" disabled={updating === u.id} onClick={() => onTogglePlan(u.id, u.plan)} className={toggleBtn(u)}>
                    {updating === u.id ? '...' : u.plan === 'pro' ? t('admin.removePro') : t('admin.givePro')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-gray-800/50">
        {users.map((u) => (
          <div key={u.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-200 font-medium text-sm truncate max-w-[60%]">{u.email}</span>
              <div className="flex items-center gap-2">
                <span className={planBadge(u.plan)}>{u.plan.toUpperCase()}</span>
                {u.role === 'admin' && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">admin</span>}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</span>
              <button type="button" disabled={updating === u.id} onClick={() => onTogglePlan(u.id, u.plan)}
                className={`${toggleBtn(u)} py-1.5`}>
                {updating === u.id ? '...' : u.plan === 'pro' ? t('admin.removePro') : t('admin.givePro')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
