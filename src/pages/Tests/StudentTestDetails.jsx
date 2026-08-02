import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getTestsByStudentId,
  scheduleInitialTestDates,
  updateTestDate,
  recordTestResult,
} from '../../services/test.service';
import ScheduleTestsModal from './ScheduleTestsModal';
import TestDateModal from './TestDateModal';
import TestResultModal from './TestResultModal';
import TestHistoryModal from './TestHistoryModal';
import { HiArrowLeft, HiCalendarDays, HiCheckCircle, HiClock } from 'react-icons/hi2';

const statusBadgeClass = (status) => {
  if (status === 'Passed') return 'bg-green-100 text-green-800';
  if (status === 'Failed') return 'bg-red-100 text-red-800';
  return 'bg-yellow-100 text-yellow-800';
};

const overallStatusBadgeClass = (status) =>
  status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

export default function StudentTestDetails() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [tests, setTests] = useState([]);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduleLoading, setIsScheduleLoading] = useState(false);

  const [dateModalTest, setDateModalTest] = useState(null);
  const [isDateLoading, setIsDateLoading] = useState(false);

  const [resultModalTest, setResultModalTest] = useState(null);
  const [isResultLoading, setIsResultLoading] = useState(false);

  const [historyTest, setHistoryTest] = useState(null);

  const pendingUndatedTests = tests.filter(
    (t) => (t.testStatus || 'Pending') === 'Pending' && !t.testDate
  );

  const loadStudentTests = async () => {
    setIsLoading(true);
    try {
      const response = await getTestsByStudentId(studentId);
      if (response?.data?.status) {
        setStudentDetails(response.data.studentDetails || null);
        setTests(response.data.tests || []);
      } else {
        toast.error(response?.data?.message || 'Failed to load student test history');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load student test history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      loadStudentTests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const handleScheduleSubmit = async ({ testDate }) => {
    setIsScheduleLoading(true);
    try {
      const response = await scheduleInitialTestDates(studentId, { testDate });
      if (response?.data?.status) {
        toast.success('Test dates scheduled successfully');
        setIsScheduleModalOpen(false);
        loadStudentTests();
      } else {
        toast.error(response?.data?.message || 'Failed to schedule test dates');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to schedule test dates');
    } finally {
      setIsScheduleLoading(false);
    }
  };

  const handleDateSubmit = async ({ testDate }) => {
    const testId = dateModalTest.testId || dateModalTest._id;
    setIsDateLoading(true);
    try {
      const response = await updateTestDate(testId, { testDate });
      if (response?.data?.status) {
        toast.success('Test date saved successfully');
        setDateModalTest(null);
        loadStudentTests();
      } else {
        toast.error(response?.data?.message || 'Failed to save test date');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save test date');
    } finally {
      setIsDateLoading(false);
    }
  };

  const handleResultSubmit = async ({ testStatus, remarks }) => {
    const testId = resultModalTest.testId || resultModalTest._id;
    setIsResultLoading(true);
    try {
      const response = await recordTestResult(testId, { testStatus, remarks });
      if (response?.data?.status) {
        toast.success('Test result saved successfully');
        setResultModalTest(null);
        loadStudentTests();
      } else {
        toast.error(response?.data?.message || 'Failed to save test result');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save test result');
    } finally {
      setIsResultLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/tests')}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-forest)] hover:opacity-80"
          >
            <HiArrowLeft className="h-4 w-4" />
            Back to Tests List
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-forest-deep)] sm:text-3xl">Student Test History</h1>
          <p className="mt-1 text-sm text-gray-600">Schedule, record results and track retests for this student</p>
        </div>

        {pendingUndatedTests.length > 0 && (
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-gold)] px-6 py-2 font-medium text-[var(--color-forest-deep)] transition-colors hover:opacity-90 sm:w-auto"
          >
            <HiCalendarDays className="h-5 w-5" />
            Schedule Tests
          </button>
        )}
      </div>

      {studentDetails && (
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Student Name</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{studentDetails.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Phone Number</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {studentDetails.mobileNumber || studentDetails.phoneNumber || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Place</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{studentDetails.place || '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Vehicle Class</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{studentDetails.vehicleClass || '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-gray-500">Current Status</p>
              <span
                className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-medium ${overallStatusBadgeClass(
                  studentDetails.currentStatus
                )}`}
              >
                {studentDetails.currentStatus || 'In Progress'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg bg-white shadow">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-gold)]" />
          </div>
        ) : tests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p className="text-lg font-medium">No tests found for this student</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tests.map((test) => {
              const testId = test.testId || test._id;
              const status = test.testStatus || 'Pending';
              const canSetDate = status !== 'Passed';
              const canRecordResult = status !== 'Passed' && !!test.testDate;

              return (
                <div key={testId} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{test.testName}</p>
                      <span
                        className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {test.testDate
                        ? `Test date: ${new Date(test.testDate).toLocaleDateString('en-IN')}`
                        : 'No date set yet'}
                    </p>
                    {test.remarks && <p className="mt-1 text-xs text-gray-500">{test.remarks}</p>}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {canSetDate && (
                      <button
                        onClick={() => setDateModalTest(test)}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200"
                      >
                        <HiCalendarDays className="h-4 w-4" />
                        {status === 'Failed' ? 'Reschedule' : 'Set Date'}
                      </button>
                    )}
                    {canRecordResult && (
                      <button
                        onClick={() => setResultModalTest(test)}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-200"
                      >
                        <HiCheckCircle className="h-4 w-4" />
                        Record Result
                      </button>
                    )}
                    <button
                      onClick={() => setHistoryTest(test)}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      <HiClock className="h-4 w-4" />
                      History
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ScheduleTestsModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSubmit={handleScheduleSubmit}
        pendingTests={pendingUndatedTests}
        isLoading={isScheduleLoading}
      />

      <TestDateModal
        isOpen={!!dateModalTest}
        onClose={() => setDateModalTest(null)}
        onSubmit={handleDateSubmit}
        test={dateModalTest}
        isLoading={isDateLoading}
      />

      <TestResultModal
        isOpen={!!resultModalTest}
        onClose={() => setResultModalTest(null)}
        onSubmit={handleResultSubmit}
        test={resultModalTest}
        isLoading={isResultLoading}
      />

      <TestHistoryModal isOpen={!!historyTest} onClose={() => setHistoryTest(null)} test={historyTest} />
    </div>
  );
}
