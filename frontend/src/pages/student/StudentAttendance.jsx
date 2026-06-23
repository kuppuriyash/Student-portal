import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, User, CheckCircle, XCircle, AlertCircle, QrCode, X, Loader2, Sparkles } from 'lucide-react';

const StudentAttendance = () => {
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Scanner Simulator Modal State
  const [showScanner, setShowScanner] = useState(false);
  const [qrInputToken, setQrInputToken] = useState('');
  const [scanLoading, setScanLoading] = useState(false);
  const [scanMessage, setScanMessage] = useState({ type: '', text: '' });

  const loadAttendance = async () => {
    try {
      const json = await fetchWithAuth('/student/attendance');
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'Could not load attendance details');
      }
    } catch (err) {
      console.error(err);
      setError('Network error syncing attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleQRScanSubmit = async (e) => {
    e.preventDefault();
    if (!qrInputToken.trim()) return;

    setScanLoading(true);
    setScanMessage({ type: '', text: '' });

    try {
      const json = await fetchWithAuth('/qr/scan', {
        method: 'POST',
        body: JSON.stringify({ qrToken: qrInputToken.trim() })
      });

      if (json.success) {
        setScanMessage({ type: 'success', text: json.message || 'Attendance registered successfully!' });
        setQrInputToken('');
        loadAttendance(); // Refresh attendance logs
      } else {
        setScanMessage({ type: 'error', text: json.message || 'QR verification failed.' });
      }
    } catch (err) {
      console.error(err);
      setScanMessage({ type: 'error', text: 'Invalid QR code signature or network timeout.' });
    } finally {
      setScanLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-sm font-semibold text-rose-600 dark:text-rose-400">
        {error}
      </div>
    );
  }

  const { summary, logs } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header & QR Simulator Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans">Attendance Log</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Detailed subject-wise analytics and class logs</p>
        </div>

        {/* QR Scan Trigger Button */}
        <button
          onClick={() => {
            setShowScanner(true);
            setScanMessage({ type: '', text: '' });
            setQrInputToken('');
          }}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-indigo-650 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer bg-indigo-605"
        >
          <QrCode className="h-4 w-4" />
          Scan Classroom QR
        </button>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summary.map((item) => (
          <div 
            key={item.courseId} 
            className="glass-panel rounded-3xl p-6 shadow-sm flex flex-col justify-between border border-slate-200/40 dark:border-slate-850"
          >
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.courseCode}</span>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 line-clamp-1 mt-0.5">{item.courseName}</h3>
                </div>
                <span className={`inline-flex rounded-xl px-2.5 py-1 text-sm font-extrabold ${
                  item.percentage >= 75 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}>
                  {item.percentage}%
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-3">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">Instructor: {item.facultyName}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 dark:border-slate-800/50 pt-4 flex justify-between text-xs font-semibold text-slate-500">
              <div className="flex flex-col items-center">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Total</span>
                <span className="text-slate-800 dark:text-slate-350 font-bold mt-0.5">{item.totalClasses}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-emerald-500 text-[10px] uppercase font-bold">Present</span>
                <span className="text-emerald-600 dark:text-emerald-450 font-bold mt-0.5">{item.presentClasses}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-rose-500 text-[10px] uppercase font-bold">Absent</span>
                <span className="text-rose-600 dark:text-rose-450 font-bold mt-0.5">{item.absentClasses}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-blue-500 text-[10px] uppercase font-bold">Excused</span>
                <span className="text-blue-600 dark:text-blue-450 font-bold mt-0.5">{item.excusedClasses}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Raw Attendance Register Logs */}
      <div className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200/40 dark:border-slate-850">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-500" />
          Raw Daily Class Registers
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/60 text-xs font-bold text-slate-400 uppercase">
                <th className="py-3">Date</th>
                <th className="py-3">Subject / Code</th>
                <th className="py-3">Marked By</th>
                <th className="py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/30">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="py-3.5 font-medium text-slate-650 dark:text-slate-400">
                    {new Date(log.date).toLocaleDateString(undefined, { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td className="py-3.5">
                    <span className="font-bold text-slate-850 dark:text-slate-300 block">{log.course.name}</span>
                    <span className="text-[10px] font-mono text-slate-450 uppercase">{log.course.code}</span>
                  </td>
                  <td className="py-3.5 text-slate-500 dark:text-slate-400">
                    {log.markedBy ? log.markedBy.name : 'N/A'}
                  </td>
                  <td className="py-3.5 text-right">
                    <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-extrabold ${
                      log.status === 'Present' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      log.status === 'Absent' ? 'bg-rose-500/10 text-rose-600' :
                      'bg-blue-500/10 text-blue-600'
                    }`}>
                      {log.status === 'Present' && <CheckCircle className="h-3 w-3" />}
                      {log.status === 'Absent' && <XCircle className="h-3 w-3" />}
                      {log.status === 'Excused' && <AlertCircle className="h-3 w-3" />}
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-450">No attendance history logged yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR SCANNER SIMULATOR MODAL (H fidelity overlay) */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-white/20 dark:border-slate-800">
            {/* Close Button */}
            <button 
              onClick={() => setShowScanner(false)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                <QrCode className="h-6 w-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Classroom QR Scanner</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px]">Paste the rotating QR code string generated on the Faculty dashboard to simulate a scan.</p>
            </div>

            {scanMessage.text && (
              <div className={`mb-6 rounded-2xl border p-4 text-xs font-semibold flex items-center gap-2 ${
                scanMessage.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
              }`}>
                {scanMessage.type === 'error' ? <AlertCircle className="h-4.5 w-4.5 shrink-0" /> : <Sparkles className="h-4.5 w-4.5 shrink-0 text-emerald-500 animate-pulse" />}
                {scanMessage.text}
              </div>
            )}

            <form onSubmit={handleQRScanSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Scanned QR Signature Token
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Paste active token here (Copy from Faculty's Dynamic QR view)..."
                  value={qrInputToken}
                  onChange={(e) => setQrInputToken(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200/60 bg-white/50 px-4 py-3 text-xs font-mono outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={scanLoading || !qrInputToken.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-xs font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {scanLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Verifying scanned signature...
                  </>
                ) : (
                  'Mark Scanner Attendance'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentAttendance;
