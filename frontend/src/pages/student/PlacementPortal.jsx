import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, MapPin, DollarSign, Calendar, Search, Award, CheckCircle2, Loader2 } from 'lucide-react';

const PlacementPortal = () => {
  const { fetchWithAuth, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [applyLoadingId, setApplyLoadingId] = useState(null);

  const loadJobs = async () => {
    try {
      const json = await fetchWithAuth('/jobs');
      if (json.success) {
        setJobs(json.data);
      } else {
        setError(json.message || 'Could not load opportunities');
      }
    } catch (err) {
      console.error(err);
      setError('Network error syncing placement portal details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleApply = async (id) => {
    setApplyLoadingId(id);
    try {
      const json = await fetchWithAuth(`/jobs/${id}/apply`, {
        method: 'POST'
      });
      if (json.success) {
        loadJobs(); // Refresh jobs to update application state
      } else {
        alert(json.message || 'Application failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting application');
    } finally {
      setApplyLoadingId(null);
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Briefcase className="h-8 w-8 text-indigo-500" />
            Opportunities Board
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Apply for verified internships and placement listings</p>
        </div>

        <div className="relative max-w-sm w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by company, role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200/60 bg-white/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800/60 dark:bg-slate-900/50 dark:focus:border-indigo-500 dark:text-slate-100"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm font-semibold text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Opportunities cards list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredJobs.map((job) => {
          const matchedSkills = job.requirements.filter(reqSkill => 
            user.skills.some(userSkill => userSkill.toLowerCase().includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(userSkill.toLowerCase()))
          );
          
          return (
            <div 
              key={job._id}
              className="glass-panel rounded-3xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{job.title}</h3>
                    <h4 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">{job.company}</h4>
                  </div>
                  <span className={`inline-flex rounded-xl px-2.5 py-1 text-xs font-bold ${
                    job.type === 'Internship' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600'
                  }`}>
                    {job.type}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-450 dark:text-slate-400 mt-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{job.salary || 'Competitive'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Apply before: {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed mt-5">
                  {job.description}
                </p>

                {/* Requirements list */}
                <div className="mt-5 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Requirements</span>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-500">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-1.5 truncate">
                        <span className="h-1 w-1 bg-slate-400 rounded-full shrink-0" />
                        <span title={req}>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Match Rate (Skills Check) */}
                {user.skills.length > 0 && (
                  <div className="mt-5 p-3 rounded-2xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/10 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-355">Profile Match:</span>
                    </div>
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                      {matchedSkills.length} / {job.requirements.length} Skills Match
                    </span>
                  </div>
                )}
              </div>

              {/* Apply Action buttons */}
              <div className="mt-8 border-t border-slate-100 dark:border-slate-800/40 pt-5">
                {job.applied ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Application Submitted</span>
                    </div>
                    <span className="inline-flex rounded-lg bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 text-xs font-bold">
                      Status: {job.applicationStatus || 'Applied'}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleApply(job._id)}
                    disabled={applyLoadingId === job._id}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {applyLoadingId === job._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Apply for this opportunity'
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredJobs.length === 0 && (
          <div className="col-span-full glass-panel rounded-3xl p-12 text-center text-slate-400">
            No openings published at this time.
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacementPortal;
