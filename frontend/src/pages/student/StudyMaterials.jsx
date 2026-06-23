import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, FileText, Search, User, Download, Calendar } from 'lucide-react';

const StudyMaterials = () => {
  const { fetchWithAuth, apiUrl } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const json = await fetchWithAuth('/student/materials');
        if (json.success) {
          setMaterials(json.data);
        } else {
          setError(json.message || 'Could not load study materials');
        }
      } catch (err) {
        console.error(err);
        setError('Network error syncing course materials');
      } finally {
        setLoading(false);
      }
    };
    loadMaterials();
  }, []);

  const filteredMaterials = materials.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.course.name.toLowerCase().includes(search.toLowerCase()) ||
    m.course.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Study Materials</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Download reference guides, syllabus notes, and lecture slides</p>
        </div>

        <div className="relative max-w-sm w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by title, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-slate-200/60 bg-white/60 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-800/60 dark:bg-slate-900/50 dark:focus:border-indigo-500 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Materials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((m) => (
          <div 
            key={m._id} 
            className="glass-panel rounded-3xl p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{m.course.code}</span>
                <div className="rounded-xl bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-2 line-clamp-1">{m.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{m.course.name}</p>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed line-clamp-3">
                {m.description || 'No description provided.'}
              </p>
            </div>

            <div className="mt-8 border-t border-slate-100 dark:border-slate-800/50 pt-4">
              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span>Instructor: {m.uploadedBy.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Download CTA */}
              <a
                href={`${apiUrl.replace('/api', '')}${m.fileUrl}`}
                target="_blank"
                rel="noreferrer"
                download
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-600 dark:text-indigo-400 hover:text-white py-2.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Download Attachment
              </a>
            </div>
          </div>
        ))}

        {filteredMaterials.length === 0 && (
          <div className="col-span-full glass-panel rounded-3xl p-12 text-center text-slate-400">
            No study materials found.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyMaterials;
