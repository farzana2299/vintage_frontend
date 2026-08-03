export default function StatCard({ label, value, icon: Icon, onClick, tone = 'default' }) {
  const toneClasses = {
    default: 'bg-white border-gray-200',
    good: 'bg-emerald-50 border-emerald-200',
    warn: 'bg-amber-50 border-amber-200',
    info: 'bg-blue-50 border-blue-200',
  }[tone];

  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left shadow-sm transition hover:shadow-md ${toneClasses} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-gray-400" />}
      </div>
      <p className="mt-2 text-2xl font-bold text-[var(--color-forest-deep)]">{value}</p>
    </Wrapper>
  );
}
