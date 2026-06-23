import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ClipboardList, 
  Calendar, 
  Award, 
  AlertCircle, 
  CheckCircle, 
  Upload, 
  Download, 
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const Assignments = () => {
  const { fetchWithAuth, apiUrl } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Submit state
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState({ type: '', text: '' });
  const [expandedId, setExpandedId] = useState(null);

  const loadAssignments = async () => {
    try {
      const json = await fetchWithAuth('/student/assignments');
      if (json.success) {
        setAssignments(json.data);
      } else {
        setError(json.message || 'Could not load assignments');
      }
    } catch (err) {
      console.error(err);
      setError('Network error syncing coursework details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadMsg({ type: '', text: '' });
  };

  const handleUploadSubmit = async (e, id) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadMsg({ type: 'error', text: 'Please select a file to upload first.' });
      return;
    }

    setUploadingId(id);
    setUploadMsg({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('submission', selectedFile);

      const res = await fetch(`${apiUrl}/student/assignments/${id}/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
          // Browser will automatically set multipart boundaries
        },
        body: formData
      });
      const json = await res.json();

      if (json.success) {
        setUploadMsg({ type: 'success', text: json.message || 'Submitted successfully!' });
        setSelectedFile(null);
        // Reload list to update submission states
        loadAssignments();
      } else {
        setUploadMsg({ type: 'error', text: json.message || 'Upload failed.' });
      }
    } catch (err) {
      console.error(err);
      setUploadMsg({ type: 'error', text: 'Error uploading submission file.' });
    } finally {
      setUploadingId(null);
    }
  };

  const getStatusBadge = (submission, dueDate) => {
    const isOverdue = new Date() > new Date(dueDate);
    if (!submission) {
      return isOverdue
        ? <span className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 text-rose-600 px-2 py-0.5 text-xs font-semibold"><AlertCircle className="h-3 w-3" /> Overdue</span>
        : <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 text-xs font-semibold"><ClockIcon className="h-3 w-3" /> Pending</span>;
    }

    if (submission.status === 'Graded') {
      return <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-xs font-semibold"><CheckCircle className="h-3 w-3" /> Graded</span>;
    }

    return <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 text-xs font-semibold"><CheckCircle className="h-3 w-3" /> Submitted</span>;
  };

  // Custom clock icon
  const ClockIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={props.className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">My Assignments</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit assignments and view grades feedback</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm font-semibold text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Checklist Grid */}
      <div className="space-y-4">
        {assignments.map((assign) => {
          const isExpanded = expandedId === assign._id;
          const hasSubmission = !!assign.submission;
          const isGraded = assign.submission?.status === 'Graded';

          return (
            <div 
              key={assign._id} 
              className="glass-panel rounded-3xl overflow-hidden shadow-sm transition-all border border-slate-200/40 dark:border-slate-850"
            >
              {/* Accordion Trigger */}
              <div 
                onClick={() => setExpandedId(isExpanded ? null : assign._id)}
                className="w-full flex flex-col md:flex-row md:items-center justify-between p-6 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/35 transition-colors gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{assign.course.code}</span>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">{assign.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{assign.course.name}</p>
                  </div>
                </div>

                <div className="flex flex-wrap md:flex-nowrap items-center gap-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Due: {new Date(assign.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Max Marks: {assign.maxMarks}</span>
                  </div>

                  {getStatusBadge(assign.submission, assign.dueDate)}

                  {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400 shrink-0 hidden md:block" /> : <ChevronDown className="h-5 w-5 text-slate-400 shrink-0 hidden md:block" />}
                </div>
              </div>

              {/* Accordion Body */}
              {isExpanded && (
                <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-800/40 pt-6 space-y-6 text-sm">
                  {/* Instructions */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-350">Assignment Instructions</h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">{assign.description}</p>
                    
                    {assign.fileUrl && (
                      <a
                        href={`${apiUrl.replace('/api', '')}${assign.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:underline px-3 py-1.5 text-xs font-semibold mt-2"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download Instruction File ({assign.fileName})
                      </a>
                    )}
                  </div>

                  {/* Submission and Grading details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-150 dark:border-slate-800/40 pt-6">
                    
                    {/* Submission Upload panel */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Your Submission</h4>
                      
                      {hasSubmission ? (
                        <div className="rounded-2xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-800/50 dark:bg-slate-900/50 space-y-3">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-indigo-500" />
                            <div className="overflow-hidden">
                              <p className="font-bold text-slate-700 dark:text-slate-350 truncate">{assign.submission.fileName}</p>
                              <span className="text-[10px] text-slate-400">Submitted: {new Date(assign.submission.submittedAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-450 dark:text-slate-500 text-xs italic">No file uploaded yet.</p>
                      )}

                      {/* File submit form */}
                      {(!isGraded) && (
                        <form onSubmit={(e) => handleUploadSubmit(e, assign._id)} className="space-y-4 pt-2">
                          <div className="flex flex-col gap-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                              {hasSubmission ? 'Re-upload Submission (Overwrite)' : 'Upload PDF/Docx File'}
                            </label>
                            <input
                              type="file"
                              onChange={handleFileChange}
                              required
                              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-950/20 dark:file:text-indigo-400 border border-slate-200/50 dark:border-slate-800 rounded-xl p-2 bg-white/40 dark:bg-slate-900/40"
                            />
                          </div>

                          {uploadMsg.text && (
                            <div className={`text-xs font-semibold ${uploadMsg.type === 'error' ? 'text-rose-500' : 'text-emerald-500'}`}>
                              {uploadMsg.text}
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={uploadingId === assign._id || !selectedFile}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {uploadingId === assign._id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-3.5 w-3.5" />
                                Submit Work
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Faculty Grade Feedback panel */}
                    <div className="space-y-4 md:border-l md:border-slate-150 md:dark:border-slate-800/40 md:pl-8">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">Evaluation details</h4>
                      
                      {isGraded ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Score Obtained</span>
                              <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{assign.submission.marksObtained}</span>
                              <span className="text-slate-400 font-bold"> / {assign.maxMarks}</span>
                            </div>
                            <div className="h-10 border-l border-slate-200 dark:border-slate-800"></div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Letter Grade</span>
                              <span className="text-xl font-extrabold rounded-lg bg-emerald-500/10 text-emerald-600 px-3 py-1 mt-0.5 inline-block">{assign.submission.grade}</span>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200/50 bg-slate-50/50 p-4 dark:border-slate-800/50 dark:bg-slate-900/50 space-y-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Comments & Feedback</span>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                              {assign.submission.feedback || 'Excellent submission.'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                          <ClockIcon className="h-4 w-4" />
                          <span>Awaiting grading and reviews by faculty.</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>
          );
        })}

        {assignments.length === 0 && (
          <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">
            No assignments assigned to you yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;
