import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CalendarDays, 
  ClipboardCheck, 
  AlertTriangle, 
  Megaphone, 
  CheckCircle, 
  Clock 
} from 'lucide-react';

const StudentDashboard = () => {
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const json = await fetchWithAuth('/student/dashboard');
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.message || 'Could not load dashboard stats');
        }
      } catch (err) {
        console.error(err);
        setError('Connection error loading dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-sm font-semibold text-rose-600 dark:text-rose-455">
        {error}
      </div>
    );
  }

  const { overallAttendance, attendanceStats, recentGrades, assignmentStats, todayTimetable, announcements } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Overview Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Academics performance and schedule overview</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Attendance circular widget */}
        <div className="glass-panel rounded-3xl p-6 flex items-center justify-between shadow-sm border border-slate-200/40 dark:border-slate-850">
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overall Attendance</h3>
            <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 block">
              {overallAttendance}%
            </span>
            <div className="mt-2.5">
              {overallAttendance < 75 ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 text-rose-600 px-2 py-0.5 text-xs font-semibold">
                  <AlertTriangle className="h-3 w-3" />
                  Below threshold (75%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-xs font-semibold">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Good Standing
                </span>
              )}
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            {/* SVG circular progress */}
            <svg className="w-20 h-20 transform -rotate-90">
              <circle cx="40" cy="40" r="34" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="6" />
              <circle 
                cx="40" 
                cy="40" 
                r="34" 
                className={`fill-none transition-all duration-500 ${overallAttendance < 75 ? 'stroke-rose-500' : 'stroke-indigo-650 stroke-indigo-600'}`} 
                strokeWidth="6" 
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - overallAttendance / 100)}`}
              />
            </svg>
            <span className="absolute text-xs font-bold text-slate-700 dark:text-slate-300">
              {overallAttendance}%
            </span>
          </div>
        </div>

        {/* Assignments KPI card */}
        <div className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200/40 dark:border-slate-850">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assignments</h3>
              <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 block">
                {assignmentStats.completed}/{assignmentStats.total}
              </span>
            </div>
            <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-400">
              <ClipboardCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-5 space-y-1.5">
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${assignmentStats.rate}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>{assignmentStats.pending} pending tasks</span>
              <span>{assignmentStats.rate}% complete</span>
            </div>
          </div>
        </div>

        {/* Timetable KPI card */}
        <div className="glass-panel rounded-3xl p-6 flex justify-between shadow-sm border border-slate-200/40 dark:border-slate-850">
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Today's Lectures</h3>
            <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 block">
              {todayTimetable.length} Slots
            </span>
            <p className="text-xs text-slate-400 mt-2 font-medium">Recorded for this weekday</p>
          </div>
          <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400 h-12">
            <CalendarDays className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Main Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Subject-wise progress stats & recent grades */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Subject progress bar charts */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200/40 dark:border-slate-850">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">Subject Attendance Summary</h3>
            <div className="space-y-4">
              {attendanceStats.map((item) => (
                <div key={item.courseId} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{item.courseName} ({item.courseCode})</span>
                    <span className={`${item.percentage < 75 ? 'text-rose-500' : 'text-indigo-650 dark:text-indigo-400'}`}>{item.percentage}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-350 ${
                        item.percentage < 75 ? 'bg-rose-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              {attendanceStats.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">No enrolled courses logged.</p>
              )}
            </div>
          </div>

          {/* Recent Grades table */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200/40 dark:border-slate-850">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Recent Graded Components</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-850 text-xs font-bold text-slate-400 uppercase">
                    <th className="py-3">Course</th>
                    <th className="py-3">Evaluation Type</th>
                    <th className="py-3">Score</th>
                    <th className="py-3 text-right">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/30">
                  {recentGrades.map((g) => (
                    <tr key={g._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                      <td className="py-3.5 font-semibold text-slate-805 dark:text-slate-300">
                        {g.course.name}
                      </td>
                      <td className="py-3.5 text-slate-500 dark:text-slate-400">{g.examType}</td>
                      <td className="py-3.5 font-mono font-medium text-slate-600 dark:text-slate-400">
                        {g.marksObtained}/{g.maxMarks}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs font-extrabold ${
                          g.grade === 'A+' || g.grade === 'A' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                          g.grade === 'B+' || g.grade === 'B' ? 'bg-blue-500/10 text-blue-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {g.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentGrades.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400">No grades registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Timetable & announcements feed */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Today's Timetable Timeline */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200/40 dark:border-slate-850">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              Today's Classes
            </h3>
            <div className="space-y-4">
              {todayTimetable.map((slot) => (
                <div key={slot._id} className="flex gap-4 border-l-2 border-indigo-500/50 pl-4 py-1">
                  <div>
                    <span className="text-xs font-extrabold text-indigo-650 dark:text-indigo-400 font-mono block">
                      {slot.startTime} - {slot.endTime}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-250 mt-0.5">{slot.course.name}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">Room: {slot.room}</span>
                  </div>
                </div>
              ))}
              {todayTimetable.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">No lectures scheduled for today.</div>
              )}
            </div>
          </div>

          {/* Announcements feed */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200/40 dark:border-slate-850">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-indigo-500" />
              Notices Board
            </h3>
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann._id} className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-200/20">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                      ann.category === 'Exam' ? 'bg-rose-500/10 text-rose-600' :
                      ann.category === 'Placement' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      ann.category === 'Academic' ? 'bg-blue-500/10 text-blue-600' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}>
                      {ann.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 mt-2">{ann.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{ann.content}</p>
                </div>
              ))}
              {announcements.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">No announcements found.</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
