import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Printer, HelpCircle, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResumeBuilder = () => {
  const { user } = useAuth();
  const [template, setTemplate] = useState('modern'); // 'modern' or 'classic'

  const handlePrint = () => {
    window.print();
  };

  const hasPortfolioData = 
    user.skills.length > 0 || 
    user.education.length > 0 || 
    user.experience.length > 0 || 
    user.projects.length > 0;

  return (
    <div className="space-y-8 animate-fade-in print:p-0">
      
      {/* Settings Panel (Hidden on print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <FileText className="h-8 w-8 text-indigo-500" />
            Resume Builder
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build and compile a professional resume from your student profile details.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Template select */}
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="rounded-2xl border border-slate-200/60 bg-white/60 px-4 py-2.5 text-xs font-semibold outline-none focus:border-indigo-500 dark:border-slate-800/60 dark:bg-slate-900/50 dark:text-slate-100 cursor-pointer"
          >
            <option value="modern">Modern Professional</option>
            <option value="classic">Classic Academic</option>
          </select>

          {/* Print Trigger */}
          <button
            onClick={handlePrint}
            disabled={!hasPortfolioData}
            className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Warning banner when portfolio details are empty (Hidden on print) */}
      {!hasPortfolioData && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Your Portfolio is Empty!</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Please populate your skills, education, experiences, and projects list in the Profile tab first.</p>
            </div>
          </div>
          <Link
            to="/profile"
            className="flex items-center gap-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            <Edit className="h-3.5 w-3.5" />
            Fill Profile Portfolio
          </Link>
        </div>
      )}

      {/* Stylesheet injection for print queries */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          /* Hide all navigation sidebar/header containers */
          aside, header, .print\\:hidden {
            display: none !important;
          }
          /* Remove sidebar indents on print body */
          lg\\:pl-64, main, .lg\\:pl-64 {
            padding: 0 !important;
            margin-left: 0 !important;
          }
          .print-container {
            border: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Resume Document Layout (Printable Sheet) */}
      <div className="flex justify-center">
        <div className={`print-container w-full max-w-[800px] min-h-[1050px] bg-white text-slate-800 p-12 shadow-xl border border-slate-200/50 rounded-[32px] dark:border-slate-800/50 dark:bg-white dark:text-slate-800 transition-all ${
          template === 'classic' ? 'font-serif' : 'font-sans'
        }`}>
          {/* Header Contact Block */}
          <div className="text-center border-b-[2px] border-slate-200 pb-6 mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user.name}</h2>
            <p className="text-sm font-semibold text-slate-500 mt-1">{user.department} | Batch of {user.batch}</p>
            
            <div className="flex justify-center flex-wrap gap-4 text-xs text-slate-400 font-medium mt-3.5">
              <span>Email: {user.email}</span>
              {user.phone && <span>• Phone: {user.phone}</span>}
              {user.address && <span>• Address: {user.address}</span>}
              {user.rollNo && <span>• Roll No: {user.rollNo}</span>}
            </div>
          </div>

          {/* Resume Body sections */}
          <div className="space-y-8 text-left">
            
            {/* Education details */}
            {user.education && user.education.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                  Education Background
                </h3>
                <div className="space-y-4">
                  {user.education.map((edu, i) => (
                    <div key={i} className="flex justify-between items-start text-sm">
                      <div>
                        <h4 className="font-bold text-slate-950">{edu.institution}</h4>
                        <p className="text-xs text-slate-500 font-medium">{edu.degree}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">{edu.year}</span>
                        <p className="text-xs text-slate-500 font-bold">{edu.percentage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience details */}
            {user.experience && user.experience.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                  Professional Experience
                </h3>
                <div className="space-y-4">
                  {user.experience.map((exp, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-start text-sm">
                        <div>
                          <h4 className="font-bold text-slate-950">{exp.company}</h4>
                          <p className="text-xs text-slate-500 font-medium">{exp.role}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-900">{exp.duration}</span>
                      </div>
                      <p className="text-xs text-slate-650 leading-relaxed pl-2">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects details */}
            {user.projects && user.projects.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                  Academic Projects
                </h3>
                <div className="space-y-4">
                  {user.projects.map((proj, i) => (
                    <div key={i} className="space-y-1 text-sm">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-950">{proj.title}</h4>
                        {proj.link && <span className="text-xs text-indigo-600 font-semibold">{proj.link}</span>}
                      </div>
                      <p className="text-xs text-slate-500 font-bold">Tech Stack: {proj.technologies}</p>
                      <p className="text-xs text-slate-650 leading-relaxed pl-2">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills details */}
            {user.skills && user.skills.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                  Technical Skills
                </h3>
                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-xs">
                  {user.skills.map((skill, i) => (
                    <span key={i} className="font-bold text-slate-800">
                      • {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

    </div>
  );
};

export default ResumeBuilder;
