import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { HiXMark } from 'react-icons/hi2';
import { getTestHistory } from '../../services/test.service';

const statusBadgeClass = (status) => {
  if (status === 'Passed') return 'bg-green-100 text-green-800';
  if (status === 'Failed') return 'bg-red-100 text-red-800';
  return 'bg-yellow-100 text-yellow-800';
};

export default function TestHistoryModal({ isOpen, onClose, test }) {
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!isOpen || !test?._id) {
      return;
    }

    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const response = await getTestHistory(test._id);
        if (response?.data?.status) {
          setHistory(response.data.history || []);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load test history');
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [isOpen, test]);

  if (!isOpen || !test) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-forest-deep)]">Test History</h2>
            <p className="mt-1 text-sm text-gray-500">
              {test.student?.name || test.studentName} &middot; {test.testName}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 transition-colors hover:text-gray-700">
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-gold)]" />
            </div>
          ) : history.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">No previous attempts recorded</p>
          ) : (
            <div className="space-y-3">
              {history.map((entry, index) => (
                <div key={entry._id || index} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-gray-900">
                      {entry.testDate ? new Date(entry.testDate).toLocaleDateString('en-IN') : '-'}
                    </p>
                    <span
                      className={`inline-block shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(
                        entry.testStatus
                      )}`}
                    >
                      {entry.testStatus}
                    </span>
                  </div>
                  {entry.remarks && <p className="mt-2 text-sm text-gray-600">{entry.remarks}</p>}
                  {entry.nextTestDate && (
                    <p className="mt-2 text-xs text-gray-500">
                      Rescheduled to {new Date(entry.nextTestDate).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
