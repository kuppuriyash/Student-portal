import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Users, UploadCloud, ClipboardCheck, Megaphone, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';

const FacultyDashboard = () => {
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState('General');
  const [annTarget, setAnnTarget] = useState('All');
  const [annSuccess, setAnnSuccess] = useState('');
  const [annLoading, setAnnLoading] = useState(false);

  const loadDashboard = async () => {
    try {
      const json = await fetchWithAuth('/faculty/dashboard');
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'Could not load faculty dashboard stats');
      }
    } catch (err) {
      console.error(err);
      setError('Connection error syncing faculty records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    setAnnLoading(true);
    setAnnSuccess('');

    try {
      const json = await fetchWithAuth('/faculty/announcements', {
        method: 'POST',
        body: JSON.stringify({
          title: annTitle,
          content: annContent,
          category: annCategory,
          targetAudience: annTarget
        })
      });

      if (json.success) {
        setAnnSuccess('Notice published successfully!');
        setAnnTitle('');
        setAnnContent('');
        loadDashboard(); // Refresh announcement list
      } else {
        alert(json.message || 'Error posting notice');
      }
    } catch (err) {
      console.error(err);
      alert('Error posting announcement');
    } finally {
      setAnnLoading(false);
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

  const { coursesCount, studentsCount, materialsCount, pendingGrading, courses, announcements } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Faculty Panel</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage attendance lists, post grades, and coordinate resources</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Assigned Courses */}
        <div className="glass-panel rounded-3xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lectures</h3>
            <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 block">{coursesCount}</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1">Teaching Subjects</span>
          </div>
          <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Total Students */}
        <div className="glass-panel rounded-3xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Students</h3>
            <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 block">{studentsCount}</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1">Enrolled Scholars</span>
          </div>
          <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Course Materials */}
        <div className="glass-panel rounded-3xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Uploaded Notes</h3>
            <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 block">{materialsCount}</span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1">Study Material Files</span>
          </div>
          <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400">
            <UploadCloud className="h-6 w-6" />
          </div>
        </div>

        {/* Pending Grading */}
        <div className="glass-panel rounded-3xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">To Grade</h3>
            <span className={`text-4xl font-extrabold mt-2 block ${pendingGrading > 0 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-100'}`}>
              {pendingGrading}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1">Unmarked Submissions</span>
          </div>
          <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-600 dark:text-rose-450">
            <ClipboardCheck className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Course List & Announcement Box Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Course cards */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">My Assigned Courses</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((c) => (
              <div 
                key={c._id} 
                className="glass-panel rounded-3xl p-6 shadow-sm border border-slate-200/45 dark:border-slate-850 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">{c.code}</span>
                  <h4 className="text-base font-bold text-slate-800 dark:text-slate-250 mt-0.5 line-clamp-1">{c.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{c.department}</p>
                </div>
                
                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-450 dark:text-slate-400">
                    {c.students.length} Enrolled Student(s)
                  </span>
                  
                  <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Announcement publisher */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-indigo-500" />
              Publish Notice
            </h3>

            {annSuccess && (
              <div className="mb-4 flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-450">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {annSuccess}
              </div>
            )}

            <form onSubmit={handlePostAnnouncement} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Notice Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Session Rescheduled"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Notice Content
                </label>
                <textarea
                  required
                  rows="3"
                  placeholder="Detailed announcement content..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                  >
                    <option value="General">General</option>
                    <option value="Academic">Academic</option>
                    <option value="Exam">Exam</option>
                    <option value="Placement">Placement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Target
                  </label>
                  <select
                    value={annTarget}
                    onChange={(e) => setAnnTarget(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-3.5 py-2 text-xs outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                  >
                    <option value="All">All Portal</option>
                    <option value="Student">Students Only</option>
                    <option value="Faculty">Faculty Only</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={annLoading}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Publish Board Notice
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacultyDashboard;
