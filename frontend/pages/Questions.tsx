import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, AlertCircle, HelpCircle, Flag } from 'lucide-react';
import { Question } from '../types';

const API_BASE_URL = 'https://neet-pyq-admin-dashboard-3.onrender.com';

export default function Questions() {
  const navigate = useNavigate();

  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'flagged'>('catalog');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [page, setPage] = useState(1);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', '10');

    if (search.trim()) params.append('search', search.trim());
    if (filterSubject) params.append('subject', filterSubject);
    if (filterYear) params.append('year', filterYear);
    if (filterDifficulty) params.append('difficulty', filterDifficulty);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/questions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server Error (${response.status})`);
      }

      setQuestions(data.questions || data.data || (Array.isArray(data) ? data : []));
    } catch (err: any) {
      console.error('Failed to load questions:', err);
      setError(err.message || 'Failed to query question records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'catalog') {
      fetchQuestions();
    }
  }, [page, filterSubject, filterYear, filterDifficulty, activeSubTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight">
            Question Registry & Issue Center
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Build the NCERT question bank, run duplicate checks, or review flagged student complaints.
          </p>
        </div>

        <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 self-start">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'catalog'
                ? 'bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400'
            }`}
          >
            Questions Catalog
          </button>
          <button
            onClick={() => setActiveSubTab('flagged')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400"
          >
            <Flag className="h-3.5 w-3.5" />
            Flagged Reports
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-950/50 dark:bg-red-950/30 p-4 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {activeSubTab === 'catalog' && (
        <>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchQuestions()}
                placeholder="Search chapters, questions or explanations..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 gap-2 min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <span className="text-xs text-neutral-400 font-semibold">Scanning catalog...</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center p-12">
                <HelpCircle className="h-10 w-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">No Questions Found</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  No matching questions found in your <code>neet_questions</code> table.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-950 text-neutral-400 uppercase font-bold tracking-wider border-b border-neutral-100 dark:border-neutral-800">
                      <th className="px-5 py-3.5">Ref Key</th>
                      <th className="px-5 py-3.5">Subject</th>
                      <th className="px-5 py-3.5">Chapter</th>
                      <th className="px-5 py-3.5">Question Text</th>
                      <th className="px-5 py-3.5">Correct Answer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {questions.map((q) => (
                      <tr key={q.id || Math.random()} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10">
                        <td className="px-5 py-4 font-mono text-[10px] text-neutral-400">
                          {String(q.id || '').slice(0, 10)}...
                        </td>
                        <td className="px-5 py-4 font-bold text-neutral-800 dark:text-neutral-200">
                          {q.subject}
                        </td>
                        <td className="px-5 py-4 font-medium text-neutral-500 max-w-[120px] truncate">
                          {q.chapter}
                        </td>
                        <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300 max-w-xs truncate">
                          {q.question || (q as any).question_text}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                            Option {q.correct_answer}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}