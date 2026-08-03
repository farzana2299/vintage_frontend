import { useMemo, useState } from 'react';

const SERIES = {
  income: { label: 'Income', color: '#2a78d6' },
  expense: { label: 'Expense', color: '#eb6834' },
};

const formatCompact = (value) =>
  new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value || 0
  );

const niceMax = (value) => {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
};

export default function IncomeExpenseChart({ daily, monthly }) {
  const [view, setView] = useState('daily');
  const [hoverIndex, setHoverIndex] = useState(null);

  const safeDaily = Array.isArray(daily) ? daily : [];
  const safeMonthly = Array.isArray(monthly) ? monthly : [];
  const points = view === 'daily' ? safeDaily : safeMonthly;

  const chart = useMemo(() => {
    const width = 720;
    const height = 260;
    const padding = { top: 16, right: 16, bottom: 32, left: 48 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const maxValue = niceMax(Math.max(1, ...points.map((p) => Math.max(p.income || 0, p.expense || 0))));
    const gridSteps = 4;
    const groupWidth = points.length > 0 ? plotWidth / points.length : plotWidth;
    const barWidth = Math.min(24, groupWidth * 0.32);
    const gap = 2;

    const yFor = (value) => padding.top + plotHeight - (value / maxValue) * plotHeight;

    const bars = points.map((point, index) => {
      const groupCenter = padding.left + groupWidth * (index + 0.5);
      const incomeHeight = (point.income / maxValue) * plotHeight;
      const expenseHeight = (point.expense / maxValue) * plotHeight;
      return {
        key: point.date || point.month || index,
        label: point.date
          ? new Date(point.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
          : point.month,
        income: point.income || 0,
        expense: point.expense || 0,
        incomeX: groupCenter - barWidth - gap / 2,
        expenseX: groupCenter + gap / 2,
        incomeY: yFor(point.income || 0),
        expenseY: yFor(point.expense || 0),
        incomeHeight,
        expenseHeight,
        groupCenter,
      };
    });

    const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
      const value = (maxValue / gridSteps) * i;
      return { value, y: yFor(value) };
    });

    return { width, height, padding, plotWidth, plotHeight, barWidth, bars, gridLines };
  }, [points]);

  const hovered = hoverIndex !== null ? chart.bars[hoverIndex] : null;

  return (
    <div className="rounded-lg bg-white p-4 shadow sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[var(--color-forest-deep)]">Income vs Expense</h3>
          <div className="mt-1 flex items-center gap-4 text-xs">
            {Object.values(SERIES).map((s) => (
              <span key={s.label} className="flex items-center gap-1.5 text-gray-600">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex rounded-lg border border-gray-300 p-0.5 text-sm">
          {['daily', 'monthly'].map((option) => (
            <button
              key={option}
              onClick={() => {
                setView(option);
                setHoverIndex(null);
              }}
              className={`rounded-md px-3 py-1 font-medium capitalize transition-colors ${
                view === option
                  ? 'bg-[var(--color-forest)] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {points.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-gray-400">
          No income/expense data for this period
        </div>
      ) : (
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            className="w-full"
            style={{ minWidth: Math.max(480, chart.bars.length * 44) }}
            role="img"
            aria-label="Income versus expense bar chart"
          >
            {chart.gridLines.map((line) => (
              <g key={line.value}>
                <line
                  x1={chart.padding.left}
                  x2={chart.width - chart.padding.right}
                  y1={line.y}
                  y2={line.y}
                  stroke="#e1e0d9"
                  strokeWidth="1"
                />
                <text x={chart.padding.left - 8} y={line.y + 3} textAnchor="end" fontSize="10" fill="#898781">
                  {formatCompact(line.value)}
                </text>
              </g>
            ))}

            {chart.bars.map((bar, index) => (
              <g
                key={bar.key}
                onMouseEnter={() => setHoverIndex(index)}
                onMouseLeave={() => setHoverIndex((current) => (current === index ? null : current))}
                style={{ cursor: 'pointer' }}
              >
                <rect x={bar.incomeX} y={chart.padding.top} width={chart.barWidth} height={chart.plotHeight} fill="transparent" />
                <rect
                  x={bar.incomeX}
                  y={bar.incomeY}
                  width={chart.barWidth}
                  height={Math.max(0, bar.incomeHeight)}
                  rx="4"
                  fill={SERIES.income.color}
                  opacity={hoverIndex === null || hoverIndex === index ? 1 : 0.45}
                />
                <rect
                  x={bar.expenseX}
                  y={bar.expenseY}
                  width={chart.barWidth}
                  height={Math.max(0, bar.expenseHeight)}
                  rx="4"
                  fill={SERIES.expense.color}
                  opacity={hoverIndex === null || hoverIndex === index ? 1 : 0.45}
                />
                <text
                  x={bar.groupCenter}
                  y={chart.height - chart.padding.bottom + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#898781"
                >
                  {bar.label}
                </text>
              </g>
            ))}

            <line
              x1={chart.padding.left}
              x2={chart.width - chart.padding.right}
              y1={chart.height - chart.padding.bottom}
              y2={chart.height - chart.padding.bottom}
              stroke="#c3c2b7"
              strokeWidth="1"
            />
          </svg>

          {hovered && (
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg"
              style={{
                left: `${(hovered.groupCenter / chart.width) * 100}%`,
                top: `${(Math.min(hovered.incomeY, hovered.expenseY) / chart.height) * 100}%`,
              }}
            >
              <p className="mb-1 font-semibold text-gray-900">{hovered.label}</p>
              <p style={{ color: SERIES.income.color }}>Income: ₹{hovered.income.toLocaleString('en-IN')}</p>
              <p style={{ color: SERIES.expense.color }}>Expense: ₹{hovered.expense.toLocaleString('en-IN')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
