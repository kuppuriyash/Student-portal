import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Users, GraduationCap, BookOpen, Briefcase, CalendarCheck, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const json = await fetchWithAuth('/admin/dashboard');
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.message || 'Could not load admin stats');
        }
      } catch (err) {
        console.error(err);
        setError('Connection error syncing admin telemetry');
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
      <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-sm font-semibold text-rose-600 dark:text-rose-450">
        {error}
      </div>
    );
  }

  const { stats, deptStats, recentUsers, recentJobs } = data;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-indigo-500" />
          Admin Analytics
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage portal roles, system registers, and academic data mapping</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Students count */}
        <div className="glass-panel rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Students</h3>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">{stats.students}</span>
          </div>
          <div className="rounded-2xl bg-indigo-500/10 p-2.5 text-indigo-600 dark:text-indigo-400">
            <GraduationCap className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Faculty count */}
        <div className="glass-panel rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Faculty</h3>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">{stats.faculty}</span>
          </div>
          <div className="rounded-2xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
            <Users className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Courses count */}
        <div className="glass-panel rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Courses</h3>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">{stats.courses}</span>
          </div>
          <div className="rounded-2xl bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
            <BookOpen className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Jobs count */}
        <div className="glass-panel rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Placements</h3>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">{stats.jobs}</span>
          </div>
          <div className="rounded-2xl bg-sky-500/10 p-2.5 text-sky-600 dark:text-sky-400">
            <Briefcase className="h-5.5 w-5.5" />
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="glass-panel rounded-3xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Attendance</h3>
            <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">{stats.attendanceRate}%</span>
          </div>
          <div className="rounded-2xl bg-rose-500/10 p-2.5 text-rose-600 dark:text-rose-455">
            <CalendarCheck className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      {/* Main Charts & registers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Department distribution Bar Chart */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">Student Distribution by Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200,200,200,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    background: 'rgba(30, 41, 59, 0.9)', 
                    border: '0', 
                    color: '#f8fafc',
                    fontSize: '11px'
                  }} 
                />
                <Bar dataKey="students" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Telemetry Actions log */}
        <div className="lg:col-span-1 glass-panel rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Quick Links</h3>
            <div className="space-y-3.5 text-xs text-slate-655 font-medium">
              <a href="/admin/users" className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/20 hover:border-indigo-500/30 transition-all">
                <ShieldCheck className="h-5 w-5 text-indigo-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Register Student/Faculty</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Define login roles and departments</p>
                </div>
              </a>
              
              <a href="/admin/courses" className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/20 hover:border-indigo-500/30 transition-all">
                <BookOpen className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Create Academic Subjects</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Assign faculty and enroll students lists</p>
                </div>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Grid for raw users lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Recent users logged */}
        <div className="glass-panel rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">Recent User Registrations</h3>
          <div className="space-y-3">
            {recentUsers.map(u => (
              <div key={u._id} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/10">
                <div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-250">{u.name}</h4>
                  <span className="text-[10px] text-slate-450">{u.email}</span>
                </div>
                <span className={`rounded-lg px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                  u.role === 'Admin' ? 'bg-indigo-500/10 text-indigo-600' :
                  u.role === 'Faculty' ? 'bg-emerald-500/10 text-emerald-600' :
                  'bg-amber-500/10 text-amber-600'
                }`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Placements Published */}
        <div className="glass-panel rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4">Recent Job Openings</h3>
          <div className="space-y-3">
            {recentJobs.map(j => (
              <div key={j._id} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/10">
                <div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-250">{j.title}</h4>
                  <span className="text-[10px] text-slate-450">{j.company} • {j.location}</span>
                </div>
                <span className="rounded-lg bg-indigo-500/10 text-indigo-600 px-2 py-0.5 text-[9px] font-bold">
                  {j.type}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
