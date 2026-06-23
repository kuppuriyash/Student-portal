import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CalendarDays, Briefcase, FileSpreadsheet, Plus, CheckCircle, Clock, Loader2 } from 'lucide-react';

const AdminReports = () => {
  const { fetchWithAuth } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Success/error alerts
  const [timetableMsg, setTimetableMsg] = useState({ type: '', text: '' });
  const [jobMsg, setJobMsg] = useState({ type: '', text: '' });

  const [timetableLoading, setTimetableLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);

  // Timetable Form fields
  const [timetableForm, setTimetableForm] = useState({
    courseId: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '09:50',
    room: 'LH-101',
    department: 'Computer Science and Engineering',
    batch: 'CSE 2023'
  });

  // Placements Form fields
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    type: 'Internship',
    salary: 'INR 1,00,000 / Month',
    deadline: ''
  });

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const json = await fetchWithAuth('/admin/courses');
        if (json.success) {
          setCourses(json.data);
          if (json.data.length > 0) {
            setTimetableForm(prev => ({ ...prev, courseId: json.data[0]._id }));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const handleTimetableSubmit = async (e) => {
    e.preventDefault();
    if (!timetableForm.courseId || !timetableForm.startTime || !timetableForm.endTime || !timetableForm.room) {
      setTimetableMsg({ type: 'error', text: 'Please fill in all slot details.' });
      return;
    }

    setTimetableLoading(true);
    setTimetableMsg({ type: '', text: '' });

    try {
      const json = await fetchWithAuth('/admin/timetable', {
        method: 'POST',
        body: JSON.stringify(timetableForm)
      });

      if (json.success) {
        setTimetableMsg({ type: 'success', text: 'Timetable lecture slot created successfully!' });
        setTimetableForm(prev => ({
          ...prev,
          startTime: '09:00',
          endTime: '09:50',
          room: 'LH-101'
        }));
      } else {
        setTimetableMsg({ type: 'error', text: json.message || 'Error saving slot.' });
      }
    } catch (err) {
      console.error(err);
      setTimetableMsg({ type: 'error', text: 'Error posting timetable slot.' });
    } finally {
      setTimetableLoading(false);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    const { title, company, description, requirements, location, deadline } = jobForm;
    if (!title || !company || !description || !requirements || !location || !deadline) {
      setJobMsg({ type: 'error', text: 'Please fill in all opportunity fields.' });
      return;
    }

    setJobLoading(true);
    setJobMsg({ type: '', text: '' });

    try {
      const json = await fetchWithAuth('/admin/jobs', {
        method: 'POST',
        body: JSON.stringify(jobForm)
      });

      if (json.success) {
        setJobMsg({ type: 'success', text: 'Placement opportunity posted successfully!' });
        setJobForm({
          title: '',
          company: '',
          description: '',
          requirements: '',
          location: '',
          type: 'Internship',
          salary: 'INR 1,00,000 / Month',
          deadline: ''
        });
      } else {
        setJobMsg({ type: 'error', text: json.message || 'Error posting listing.' });
      }
    } catch (err) {
      console.error(err);
      setJobMsg({ type: 'error', text: 'Error posting job opportunity.' });
    } finally {
      setJobLoading(false);
    }
  };

  // Mock reports download triggers
  const triggerReportDownload = (type) => {
    alert(`Generating ${type} report...\nYour browser will automatically download the CSV/PDF compile file containing academic system analytics. (Simulated complete success)`);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
          <FileSpreadsheet className="h-8 w-8 text-indigo-500" />
          Academic configurations
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure weekly schedules, post vacancies, and compile attendance sheets</p>
      </div>

      {/* Main Grid: Left column has timetable & placement forms; Right column has Reports compiler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Forms column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Timetable form */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <CalendarDays className="h-5.5 w-5.5 text-indigo-500" />
              Schedule Timetable Lecture
            </h3>

            {timetableMsg.text && (
              <div className={`mb-4 rounded-2xl border p-4 text-xs font-semibold flex items-center gap-1.5 ${
                timetableMsg.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
              }`}>
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                {timetableMsg.text}
              </div>
            )}

            <form onSubmit={handleTimetableSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                    Select Subject
                  </label>
                  <select
                    value={timetableForm.courseId}
                    onChange={(e) => setTimetableForm(prev => ({ ...prev, courseId: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/60 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
                  >
                    {courses.map(c => (
                      <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                    Weekday
                  </label>
                  <select
                    value={timetableForm.dayOfWeek}
                    onChange={(e) => setTimetableForm(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/60 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:00"
                    value={timetableForm.startTime}
                    onChange={(e) => setTimetableForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                    End Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:50"
                    value={timetableForm.endTime}
                    onChange={(e) => setTimetableForm(prev => ({ ...prev, endTime: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="LH-101"
                    value={timetableForm.room}
                    onChange={(e) => setTimetableForm(prev => ({ ...prev, room: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                    Target Batch
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CSE 2023"
                    value={timetableForm.batch}
                    onChange={(e) => setTimetableForm(prev => ({ ...prev, batch: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                </div>
              </div>

              <input
                type="hidden"
                value={timetableForm.department}
              />

              <button
                type="submit"
                disabled={timetableLoading || courses.length === 0}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer pt-2"
              >
                {timetableLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Weekly Lecture Slot
              </button>
            </form>
          </div>

          {/* Job publisher form */}
          <div className="glass-panel rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <Briefcase className="h-5.5 w-5.5 text-indigo-500" />
              Publish Placement Vacancy
            </h3>

            {jobMsg.text && (
              <div className={`mb-4 rounded-2xl border p-4 text-xs font-semibold flex items-center gap-1.5 ${
                jobMsg.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
              }`}>
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                {jobMsg.text}
              </div>
            )}

            <form onSubmit={handleJobSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                    Job / Internship Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Software Engineering Intern"
                    value={jobForm.title}
                    onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Google"
                    value={jobForm.company}
                    onChange={(e) => setJobForm(prev => ({ ...prev, company: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                  Job Description Scope
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Overview of duties, workload details..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-855 dark:bg-slate-900/50 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                  Requirements (Comma separated list)
                </label>
                <input
                  type="text"
                  required
                  placeholder="React, Node.js, DSA, Java"
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm(prev => ({ ...prev, requirements: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-855 dark:bg-slate-900/50 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bangalore, India"
                    value={jobForm.location}
                    onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                    Offered Salary (Annual/Monthly)
                  </label>
                  <input
                    type="text"
                    placeholder="INR 12,00,000 / Annum"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm(prev => ({ ...prev, salary: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-505 uppercase tracking-wider mb-1.5">
                    Role Category
                  </label>
                  <select
                    value={jobForm.type}
                    onChange={(e) => setJobForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/60 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Full-time">Full-time Job</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-550 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Apply Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={jobLoading}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer pt-2"
              >
                {jobLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Publish Opportunity
              </button>
            </form>
          </div>

        </div>

        {/* Reports downloader panel (Right Column) */}
        <div className="lg:col-span-1 glass-panel rounded-3xl p-6 shadow-md h-fit space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-200">System registers compilations</h3>
            <p className="text-xs text-slate-450 mt-1">Export database registries in standardized layouts for audit boards.</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => triggerReportDownload('Portal Attendance Registers')}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 py-3 text-xs font-bold transition-all cursor-pointer"
            >
              Export Attendance Ledger (CSV)
            </button>

            <button
              onClick={() => triggerReportDownload('Portal Semester Results GradeSheet')}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 py-3 text-xs font-bold transition-all cursor-pointer"
            >
              Export Marks Register (PDF)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminReports;
