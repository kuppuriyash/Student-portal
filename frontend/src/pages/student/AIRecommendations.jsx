import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bot, Send, Brain, Sparkles, AlertCircle, FileText, Download, CheckCircle } from 'lucide-react';

const AIRecommendations = () => {
  const { fetchWithAuth, apiUrl } = useAuth();
  
  // Performance recommender state
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState(null);
  const [error, setError] = useState('');

  // Chatbot state
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your AI Academic Advisor. I can analyze your attendance and grades, suggest tailored study schedules, recommend reading material, or help with placement preparation. Try asking me "How can I improve my grades?"' }
  ]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

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

  useEffect(() => {
    // Auto-scroll chat to bottom
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setChatLoading(true);

    try {
      const json = await fetchWithAuth('/student/ai-chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage })
      });

      if (json.success) {
        // Typing simulation delay for UX realism
        setTimeout(() => {
          setMessages(prev => [...prev, { role: 'assistant', text: json.data.reply }]);
          setChatLoading(false);
        }, 800);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I fumbled that. Please try asking again!' }]);
        setChatLoading(false);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I am having trouble connecting to the academic server.' }]);
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      
      {/* AI Recommendation Engine Cards (Left/Center) */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Brain className="h-8 w-8 text-indigo-500" />
            AI Study recommendations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Automatic telemetry evaluating grades, indicating revision items</p>
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm font-semibold text-rose-600 dark:text-rose-400 animate-shake">
            {error}
          </div>
        )}

        {/* List of recommended items */}
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

      {/* AI Academic Advisor Chatbot (Right Side Panel) */}
      <div className="lg:col-span-1 flex flex-col h-[600px] glass-panel rounded-3xl overflow-hidden shadow-md">
        {/* Chat header */}
        <div className="flex items-center gap-3 p-5 bg-gradient-to-tr from-indigo-500/10 to-violet-600/5 dark:from-indigo-950/20 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
            <Bot className="h-5.5 w-5.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Academix Assistant</h3>
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Online Advisor
            </span>
          </div>
        </div>

        {/* Message body logs */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, index) => {
            const isBot = msg.role === 'assistant';
            return (
              <div 
                key={index} 
                className={`flex gap-3 max-w-[85%] ${isBot ? '' : 'ml-auto flex-row-reverse'}`}
              >
                {isBot && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div 
                  className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed font-medium ${
                    isBot 
                      ? 'bg-slate-50 text-slate-800 dark:bg-slate-800/50 dark:text-slate-300 border border-slate-100 dark:border-slate-800/20' 
                      : 'bg-indigo-600 text-white shadow-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          {chatLoading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 shrink-0 mt-0.5">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-850 flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" />
                <span className="h-1.5 w-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800/40">
          <div className="relative">
            <input
              type="text"
              placeholder="Ask for advice..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={chatLoading}
              className="w-full rounded-2xl border border-slate-200/60 bg-slate-50/50 pl-4 pr-11 py-2.5 text-xs outline-none focus:border-indigo-500 focus:bg-white dark:border-slate-850 dark:bg-slate-900/50 dark:text-slate-100 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={chatLoading || !input.trim()}
              className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-30 disabled:hover:bg-indigo-600 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default AIRecommendations;
