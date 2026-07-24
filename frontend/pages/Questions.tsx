import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Flag
} from 'lucide-react';
import { Question } from '../types';

const API_BASE_URL = 'https://neet-pyq-admin-dashboard-3.onrender.com';

export default function Questions() {
  const navigate = useNavigate();

  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'flagged'>('catalog');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters and Pagination
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(1200);

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

      const fetchedList = data.questions || data.data || (Array.isArray(data) ? data : []);
      setQuestions(fetchedList);
      setTotalPages(data.totalPages || Math.ceil((data.total || fetchedList.length) / 10) || 1);
      setTotalQuestions(data.total || fetchedList.length || 1200);
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Sub-tab Switcher */}
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

      {/* Notifications */}
      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-950/50 dark:bg-emerald-950/30 p-4 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-950/50 dark:bg-red-950/30 p-4 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* SUB-TAB 1: CATALOG */}
      {activeSubTab === 'catalog' && (
        <>
          {/* Search & Filters Bar */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-3">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chapters, questions or explanations..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs focus:border-emerald-500 focus:outline-hidden"
              />
            </form>

            <div className="grid grid-cols-3 gap-2 shrink-0">
              <select
                value={filterSubject}
                onChange={(e) => {
                  setFilterSubject(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs focus:border-emerald-500 text-neutral-600 dark:text-neutral-400"
              >
                <option value="">All Subjects</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Botany">Botany</option>
                <option value="Zoology">Zoology</option>
              </select>

              <select
                value={filterYear}
                onChange={(e) => {
                  setFilterYear(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs focus:border-emerald-500 text-neutral-600 dark:text-neutral-400"
              >
                <option value="">All Years</option>
                {[2025, 2024, 2023, 2022, 2021, 2020].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>

              <select
                value={filterDifficulty}
                onChange={(e) => {
                  setFilterDifficulty(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs focus:border-emerald-500 text-neutral-600 dark:text-neutral-400"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <button
              onClick={() => alert('Add question form dialog opens')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add Question
            </button>
          </div>

          {/* Table Area */}
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
                  Try adjusting search criteria or subject filters.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-50 dark:bg-neutral-950 text-neutral-400 uppercase font-bold tracking-wider border-b border-neutral-100 dark:border-neutral-800">
                        <th className="px-5 py-3.5">Ref Key</th>
                        <th className="px-5 py-3.5">Subject</th>
                        <th className="px-5 py-3.5">Chapter</th>
                        <th className="px-5 py-3.5">Question Text</th>
                        <th className="px-5 py-3.5">Correct Answer</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {questions.map((q) => {
                        const rawAns = String(q.correct_answer || 'A').replace(/Option\s*/i, '');
                        return (
                          <tr key={q.id || Math.random()} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/10">
                            <td className="px-5 py-4 font-mono text-[10px] text-neutral-400">
                              {String(q.id || '').slice(0, 10)}...
                            </td>
                            <td className="px-5 py-4 font-bold text-neutral-800 dark:text-neutral-200">
                              {q.subject}
                            </td>
                            <td className="px-5 py-4 font-medium text-neutral-500 max-w-[140px] truncate" title={q.chapter}>
                              {q.chapter}
                            </td>
                            <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300 max-w-sm truncate" title={q.question}>
                              {q.question || (q as any).question_text}
                            </td>
                            <td className="px-5 py-4">
                              <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] whitespace-nowrap">
                                Option {rawAns}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right whitespace-nowrap">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  className="p-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
                                  title="Edit Question"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  className="p-1.5 rounded-md border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                                  title="Delete Question"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
                  <div>
                    Showing <strong className="text-neutral-800 dark:text-neutral-200">{(page - 1) * 10 + 1}–{Math.min(page * 10, totalQuestions)}</strong> of <strong className="text-neutral-800 dark:text-neutral-200">{totalQuestions}</strong> high-yield questions
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300 px-2">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}