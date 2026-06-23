import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Brain, Sparkles, AlertCircle, FileText, Download, CheckCircle } from 'lucide-react';

const AIRecommendations = () => {
  const { fetchWithAuth, apiUrl } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const json = await fetchWithAuth('/student/ai-recommendations');
        if (json.success) {
          setRecs(json.data);
        } else {
          setError(json.message || 'Could not load AI recommendations');
        }
      } catch (err) {
        console.error(err);
        setError('Network error compiling performance analytics');
      } finally {
        setLoading(false);
      }
    };
    loadRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
          <Brain className="h-8 w-8 text-indigo-500" />
          Academic recommendations
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Automatic telemetry evaluating grades, indicating revision items</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm font-semibold text-rose-600 dark:text-rose-400 animate-shake">
          {error}
        </div>
      )}

      {/* List of recommended items */}
      <div className="space-y-6">
        {recs && recs.recommendations.map((rec, index) => {
          const isExcellent = rec.status === 'Excellent';
          return (
            <div 
              key={index}
              className={`glass-panel rounded-3xl p-6 shadow-sm border-l-4 ${
                isExcellent ? 'border-l-emerald-500' : 'border-l-amber-500'
              }`}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-2">
                  {isExcellent ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                  )}
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {isExcellent ? 'Academic Standing' : `${rec.courseName} (${rec.courseCode})`}
                  </h3>
                </div>
                
                {!isExcellent && (
                  <span className="rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 text-xs font-extrabold">
                    Score: {rec.score}%
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mt-4">
                {rec.advice}
              </p>

              {/* Recommended Study Material checklist */}
              {rec.suggestedMaterials && rec.suggestedMaterials.length > 0 && (
                <div className="mt-6 border-t border-slate-100 dark:border-slate-800/40 pt-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    Suggested Study Resources
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {rec.suggestedMaterials.map((mat, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/30">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileText className="h-5 w-5 text-indigo-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-350 truncate">{mat.title}</span>
                        </div>
                        <a
                          href={`${apiUrl.replace('/api', '')}${mat.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIRecommendations;
