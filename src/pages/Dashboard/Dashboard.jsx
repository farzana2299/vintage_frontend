export default function Dashboard() {
  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-forest-deep)] mb-2">
          Dashboard
        </h1>
        <p className="text-[rgba(18,33,28,0.6)]">
          Welcome to your Vintage Driving School management dashboard
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Students', value: '245', color: 'bg-blue-50 border-blue-200' },
          { label: 'Active Trainers', value: '12', color: 'bg-green-50 border-green-200' },
          { label: 'Pending Tests', value: '18', color: 'bg-amber-50 border-amber-200' },
          { label: 'Monthly Income', value: '$8,520', color: 'bg-emerald-50 border-emerald-200' },
        ].map((card, i) => (
          <div
            key={i}
            className={`rounded-2xl border p-6 ${card.color} shadow-sm hover:shadow-md transition`}
          >
            <p className="text-sm font-medium text-[rgba(18,33,28,0.6)] mb-1">
              {card.label}
            </p>
            <p className="text-3xl font-bold text-[var(--color-forest-deep)]">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Content Section */}
      <div className="rounded-2xl border border-[rgba(18,33,28,0.09)] bg-[rgba(255,252,245,0.76)] p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-[var(--color-forest-deep)] mb-4">
          Quick Actions
        </h2>
        <p className="text-[rgba(18,33,28,0.6)] mb-6">
          Use the sidebar menu to navigate between different sections of your driving school management system.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Manage Students', 'View Schedules', 'Check Payments', 'Review Tests', 'Track Attendance'].map((action, i) => (
            <button
              key={i}
              className="px-4 py-3 rounded-xl border border-[var(--color-forest)] text-[var(--color-forest)] hover:bg-[var(--color-forest)] hover:text-[var(--color-cream)] font-medium transition"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
