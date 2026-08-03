import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiUsers,
  HiUserGroup,
  HiCheckCircle,
  HiClipboardDocumentList,
  HiCalendarDays,
  HiIdentification,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiBanknotes,
  HiArrowPath,
  HiExclamationTriangle,
} from 'react-icons/hi2';
import { getDashboard, getRoadSafetyPendingCount } from '../../services/dashboard.service';
import StatCard from './components/StatCard';
import IncomeExpenseChart from './components/IncomeExpenseChart';
import { VEHICLE_CLASS_OPTIONS, TEST_STATUS_OPTIONS } from '../../constants/constants';

const getMonthStartLocal = () => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const offsetMilliseconds = monthStart.getTimezoneOffset() * 60 * 1000;
  return new Date(monthStart.getTime() - offsetMilliseconds).toISOString().split('T')[0];
};

const getTodayLocal = () => {
  const now = new Date();
  const offsetMilliseconds = now.getTimezoneOffset() * 60 * 1000;
  return new Date(now.getTime() - offsetMilliseconds).toISOString().split('T')[0];
};

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const testStatusBadgeClass = (status) => {
  if (status === 'Passed') return 'bg-green-100 text-green-800';
  if (status === 'Failed') return 'bg-red-100 text-red-800';
  return 'bg-yellow-100 text-yellow-800';
};

function TableSection({ title, count, columns, rows, emptyText = 'Nothing to show', onRowClick, rowClass }) {
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="rounded-lg bg-white p-4 shadow sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-[var(--color-forest-deep)]">{title}</h3>
        {typeof count === 'number' && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{count}</span>
        )}
      </div>
      {safeRows.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((col) => (
                  <th key={col.key} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-gray-700">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {safeRows.map((row, index) => (
                <tr
                  key={row._key ?? index}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${
                    rowClass ? rowClass(row) : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-3 py-2 text-gray-700">
                      {col.render ? col.render(row) : row[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function WarningBlock({ title, priority, rows, columns, onRowClick }) {
  const safeRows = Array.isArray(rows) ? rows : [];
  if (safeRows.length === 0) return null;

  const isHigh = priority === 'High';
  const badgeClass = isHigh ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';

  return (
    <div className={`rounded-lg border p-4 ${isHigh ? 'border-red-200 bg-red-50/40' : 'border-amber-200 bg-amber-50/40'}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <HiExclamationTriangle className={`h-5 w-5 ${isHigh ? 'text-red-500' : 'text-amber-500'}`} />
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>{priority} priority</span>
        </div>
        <span className="text-xs font-medium text-gray-500">
          {safeRows.length} student{safeRows.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-3 py-2 text-left font-medium text-gray-600">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {safeRows.map((row, index) => (
              <tr
                key={row._key ?? index}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'cursor-pointer hover:bg-white' : ''}
              >
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-3 py-2 text-gray-700">
                    {col.render ? col.render(row) : row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [fromDate, setFromDate] = useState(getMonthStartLocal());
  const [toDate, setToDate] = useState(getTodayLocal());
  const [vehicleClass, setVehicleClass] = useState('');
  const [testStatus, setTestStatus] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);

  const [roadSafetyPending, setRoadSafetyPending] = useState(0);
  const [roadSafetyLoading, setRoadSafetyLoading] = useState(false);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const params = { fromDate, toDate };
      if (vehicleClass) params.vehicleClass = vehicleClass;
      if (testStatus) params.testStatus = testStatus;

      const response = await getDashboard(params);
      if (response?.data?.status) {
        setData(response.data.data || response.data);
      } else {
        toast.error(response?.data?.message || 'Failed to load dashboard');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoadSafetyPending = async () => {
    setRoadSafetyLoading(true);
    try {
      const response = await getRoadSafetyPendingCount({ fromDate, toDate });
      if (response?.data?.status) {
        setRoadSafetyPending(response.data.count ?? 0);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load road safety pending count');
    } finally {
      setRoadSafetyLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboard();
    fetchRoadSafetyPending();
  };

  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = data?.summaryCards || {};
  const upcomingTests = data?.upcomingTests || [];
  const licenceExpiry = data?.learnersLicenceExpiry || [];
  const warnings = data?.warnings || {};
  const recentRegistrations = data?.recentRegistrations || [];
  const recentEnquiries = data?.recentEnquiries || [];
  const financial = data?.financialSummary || {};
  const chart = data?.incomeExpenseChart || { daily: [], monthly: [] };
  const testSummary = data?.testSummary || {};
  const attendanceSummary = data?.attendanceSummary || {};
  const trainerSummary = data?.trainerSummary || {};

  const allWarningsEmpty =
    data &&
    ['testScheduledClassesIncomplete', 'roadSafetyPending', 'licenceExpiringSoon', 'failedTestsAwaitingReschedule', 'pendingRegistrationPayment', 'pendingClassFeePayment'].every(
      (key) => !Array.isArray(warnings[key]) || warnings[key].length === 0
    );

  return (
    <div className="space-y-6 px-4 py-3 sm:px-6 sm:py-5 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-forest-deep)] sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome to your Vintage Driving School management dashboard
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              max={toDate}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Vehicle Class</label>
            <select
              value={vehicleClass}
              onChange={(e) => setVehicleClass(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
            >
              <option value="">All Vehicle Classes</option>
              {VEHICLE_CLASS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Test Status</label>
            <select
              value={testStatus}
              onChange={(e) => setTestStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[var(--color-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/20"
            >
              <option value="">All Statuses</option>
              {TEST_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRefresh}
              disabled={isLoading || roadSafetyLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-forest)] px-4 py-2 font-medium text-white transition-colors hover:bg-[var(--color-forest-deep)] disabled:opacity-50"
            >
              <HiArrowPath className={`h-4 w-4 ${isLoading || roadSafetyLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {isLoading && !data ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-gold)]" />
        </div>
      ) : (
        <>
          {/* 1. Summary Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard label="Total Students" value={summary.totalStudents ?? 0} icon={HiUsers} onClick={() => navigate('/students')} />
            <StatCard label="Active Students" value={summary.activeStudents ?? 0} icon={HiUserGroup} onClick={() => navigate('/students')} tone="info" />
            <StatCard label="Completed Students" value={summary.completedStudents ?? 0} icon={HiCheckCircle} onClick={() => navigate('/students')} tone="good" />
            <StatCard label="New Enquiries" value={summary.newEnquiries ?? 0} icon={HiClipboardDocumentList} onClick={() => navigate('/enquiry')} />
            <StatCard
              label="Upcoming Driving Tests"
              value={summary.upcomingDrivingTests ?? 0}
              icon={HiCalendarDays}
              onClick={() => navigate(`/tests?fromDate=${fromDate}&toDate=${toDate}`)}
              tone="info"
            />
            <StatCard
              label="Learner's Licence Expiring"
              value={summary.learnersLicenceExpiring ?? 0}
              icon={HiIdentification}
              onClick={() => navigate(`/students?licenceExpiryFrom=${fromDate}&licenceExpiryTo=${toDate}`)}
              tone="warn"
            />
            <StatCard label="Total Income" value={formatCurrency(summary.totalIncome)} icon={HiArrowTrendingUp} onClick={() => navigate('/income')} tone="good" />
            <StatCard label="Total Expense" value={formatCurrency(summary.totalExpense)} icon={HiArrowTrendingDown} onClick={() => navigate('/expense')} tone="warn" />
            <StatCard label="Net Profit" value={formatCurrency(summary.netProfit)} icon={HiBanknotes} />
            <StatCard
              label="Road Safety Class Pending"
              value={roadSafetyLoading ? '…' : roadSafetyPending}
              icon={HiExclamationTriangle}
              onClick={() =>
                navigate(`/students?roadSafetyStatus=No&studentType=${encodeURIComponent('Driving Licence')}`)
              }
              tone="warn"
            />
          </div>

          {/* 2. Upcoming Driving Tests */}
          {/* <TableSection
            title="Upcoming Driving Tests"
            count={upcomingTests.length}
            emptyText="No upcoming tests in this period"
            rows={upcomingTests}
            onRowClick={(row) => row.studentId && navigate(`/tests/student/${row.studentId}`)}
            columns={[
              { key: 'studentName', label: 'Student' },
              { key: 'vehicleClass', label: 'Vehicle Class' },
              { key: 'testName', label: 'Test Name' },
              {
                key: 'testDate',
                label: 'Test Date',
                render: (r) => (r.testDate ? new Date(r.testDate).toLocaleDateString('en-IN') : '-'),
              },
              { key: 'attempt', label: 'Attempt' },
              {
                key: 'testStatus',
                label: 'Status',
                render: (r) => (
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${testStatusBadgeClass(r.testStatus)}`}>
                    {r.testStatus || 'Pending'}
                  </span>
                ),
              },
            ]}
          /> */}

          {/* 3. Learner's Licence Expiry */}
          {/* <TableSection
            title="Learner's Licence Expiry"
            count={licenceExpiry.length}
            emptyText="No learner's licences expiring in this period"
            rows={licenceExpiry}
            onRowClick={(row) => row.studentId && navigate('/students')}
            rowClass={(r) => (r.daysRemaining <= 30 ? 'bg-amber-50' : '')}
            columns={[
              { key: 'studentName', label: 'Student' },
              { key: 'mobileNumber', label: 'Mobile Number' },
              { key: 'vehicleClass', label: 'Vehicle Class' },
              {
                key: 'learnersExpiryDate',
                label: "Learner's Expiry Date",
                render: (r) => (r.learnersExpiryDate ? new Date(r.learnersExpiryDate).toLocaleDateString('en-IN') : '-'),
              },
              {
                key: 'daysRemaining',
                label: 'Days Remaining',
                render: (r) => (
                  <span className={r.daysRemaining <= 30 ? 'font-semibold text-amber-700' : ''}>{r.daysRemaining}</span>
                ),
              },
            ]}
          /> */}

          {/* 4. Students Requiring Immediate Attention */}
          {/* <div className="space-y-4 rounded-lg bg-white p-4 shadow sm:p-6">
            <h3 className="text-base font-semibold text-[var(--color-forest-deep)]">
              Students Requiring Immediate Attention
            </h3>

            {allWarningsEmpty ? (
              <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                <HiCheckCircle className="h-5 w-5" />
                All clear — no students need immediate attention
              </p>
            ) : (
              <div className="space-y-4">
                <WarningBlock
                  title="Test Scheduled but Classes Not Completed"
                  priority="High"
                  rows={warnings.testScheduledClassesIncomplete}
                  onRowClick={(row) => row.studentId && navigate(`/tests/student/${row.studentId}`)}
                  columns={[
                    { key: 'studentName', label: 'Student' },
                    { key: 'testName', label: 'Test Name' },
                    { key: 'testDate', label: 'Test Date', render: (r) => (r.testDate ? new Date(r.testDate).toLocaleDateString('en-IN') : '-') },
                    { key: 'classesCompleted', label: 'Classes Completed' },
                    { key: 'requiredClasses', label: 'Required Classes' },
                  ]}
                />

                <WarningBlock
                  title="Road Safety Class Pending"
                  priority="High"
                  rows={warnings.roadSafetyPending}
                  onRowClick={(row) => row.studentId && navigate(`/tests/student/${row.studentId}`)}
                  columns={[
                    { key: 'studentName', label: 'Student' },
                    { key: 'testDate', label: 'Test Date', render: (r) => (r.testDate ? new Date(r.testDate).toLocaleDateString('en-IN') : '-') },
                    { key: 'roadSafetyStatus', label: 'Road Safety Status' },
                  ]}
                />

                <WarningBlock
                  title="Learner's Licence Expiring Soon"
                  priority="Medium"
                  rows={warnings.licenceExpiringSoon}
                  onRowClick={() => navigate('/students')}
                  columns={[
                    { key: 'studentName', label: 'Student' },
                    { key: 'expiryDate', label: 'Expiry Date', render: (r) => (r.expiryDate ? new Date(r.expiryDate).toLocaleDateString('en-IN') : '-') },
                    { key: 'daysRemaining', label: 'Days Remaining' },
                  ]}
                />

                <WarningBlock
                  title="Failed Tests Awaiting Rescheduling"
                  priority="High"
                  rows={warnings.failedTestsAwaitingReschedule}
                  onRowClick={(row) => row.studentId && navigate(`/tests/student/${row.studentId}`)}
                  columns={[
                    { key: 'studentName', label: 'Student' },
                    { key: 'vehicleClass', label: 'Vehicle Class' },
                    { key: 'failedTest', label: 'Failed Test' },
                    { key: 'failedDate', label: 'Failed Date', render: (r) => (r.failedDate ? new Date(r.failedDate).toLocaleDateString('en-IN') : '-') },
                  ]}
                />

                <WarningBlock
                  title="Pending Registration Payment"
                  priority="High"
                  rows={warnings.pendingRegistrationPayment}
                  onRowClick={(row) => row.studentId && navigate(`/payments/student/${row.studentId}`)}
                  columns={[
                    { key: 'studentName', label: 'Student' },
                    { key: 'mobileNumber', label: 'Mobile Number' },
                  ]}
                />

                <WarningBlock
                  title="Pending Class Fee Payment"
                  priority="High"
                  rows={warnings.pendingClassFeePayment}
                  onRowClick={(row) => row.studentId && navigate(`/payments/student/${row.studentId}`)}
                  columns={[
                    { key: 'studentName', label: 'Student' },
                    { key: 'mobileNumber', label: 'Mobile Number' },
                  ]}
                />
              </div>
            )}
          </div> */}

          {/* 5 & 6. Recent Registrations + Recent Enquiries */}
          {/* <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TableSection
              title="Recent Student Registrations"
              rows={recentRegistrations}
              emptyText="No recent registrations"
              onRowClick={() => navigate('/students')}
              columns={[
                { key: 'studentName', label: 'Student' },
                { key: 'mobileNumber', label: 'Mobile' },
                { key: 'vehicleClass', label: 'Vehicle Class' },
                {
                  key: 'registrationDate',
                  label: 'Registration Date',
                  render: (r) => (r.registrationDate ? new Date(r.registrationDate).toLocaleDateString('en-IN') : '-'),
                },
              ]}
            />

            <TableSection
              title="Recent Enquiries"
              rows={recentEnquiries}
              emptyText="No recent enquiries"
              onRowClick={() => navigate('/enquiry')}
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'phone', label: 'Phone' },
                { key: 'place', label: 'Place' },
                { key: 'enquiryType', label: 'Type' },
                { key: 'date', label: 'Date', render: (r) => (r.date ? new Date(r.date).toLocaleDateString('en-IN') : '-') },
              ]}
            />
          </div> */}

          {/* 7. Financial Summary */}
          {/* <div className="rounded-lg bg-white p-4 shadow sm:p-6">
            <h3 className="mb-4 text-base font-semibold text-[var(--color-forest-deep)]">Financial Summary</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[
                { label: 'Registration Fee Income', value: financial.registrationFeeIncome },
                { label: 'Class Fee Income', value: financial.classFeeIncome },
                { label: 'Test Fee Income', value: financial.testFeeIncome },
                { label: 'Other Income', value: financial.otherIncome },
                { label: 'Total Income', value: financial.totalIncome },
                { label: 'Total Expense', value: financial.totalExpense },
                { label: 'Net Profit', value: financial.netProfit },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs uppercase tracking-[0.1em] text-gray-400">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(item.value)}</p>
                </div>
              ))}
            </div>
          </div> */}

          {/* 8. Income vs Expense Chart */}
          {/* <IncomeExpenseChart daily={chart.daily} monthly={chart.monthly} /> */}

          {/* 9, 10, 11. Test / Attendance / Trainer Summary */}
          {/* <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-4 shadow sm:p-6">
              <h3 className="mb-4 text-base font-semibold text-[var(--color-forest-deep)]">Driving Test Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Pending" value={testSummary.pending ?? 0} tone="warn" onClick={() => navigate('/tests')} />
                <StatCard label="Passed" value={testSummary.passed ?? 0} tone="good" onClick={() => navigate('/tests')} />
                <StatCard label="Failed" value={testSummary.failed ?? 0} onClick={() => navigate('/tests')} />
                <StatCard label="Rescheduled" value={testSummary.rescheduled ?? 0} tone="info" onClick={() => navigate('/tests')} />
              </div>
            </div>

            <div className="rounded-lg bg-white p-4 shadow sm:p-6">
              <h3 className="mb-4 text-base font-semibold text-[var(--color-forest-deep)]">Attendance Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Classes Conducted" value={attendanceSummary.classesConducted ?? 0} onClick={() => navigate('/attendance')} />
                <StatCard label="Total Attendance Entries" value={attendanceSummary.totalAttendanceEntries ?? 0} onClick={() => navigate('/attendance')} />
                <StatCard label="Completed Required Classes" value={attendanceSummary.studentsCompleted ?? 0} tone="good" onClick={() => navigate('/attendance')} />
                <StatCard label="Yet to Complete Classes" value={attendanceSummary.studentsPending ?? 0} tone="warn" onClick={() => navigate('/attendance')} />
              </div>
            </div>

            <div className="rounded-lg bg-white p-4 shadow sm:p-6">
              <h3 className="mb-4 text-base font-semibold text-[var(--color-forest-deep)]">Trainer Summary</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <StatCard label="Active Trainers" value={trainerSummary.activeTrainers ?? 0} onClick={() => navigate('/trainers')} />
                <StatCard label="Classes Conducted Today" value={trainerSummary.classesToday ?? 0} onClick={() => navigate('/attendance')} />
                <StatCard label="Classes Conducted This Month" value={trainerSummary.classesThisMonth ?? 0} onClick={() => navigate('/attendance')} />
              </div>
            </div>
          </div> */}
        </>
      )}
    </div>
  );
}
