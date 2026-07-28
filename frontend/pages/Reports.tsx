import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  FileQuestion,
  User,
  Plus,
  Loader2,
  Trash2,
  Edit3,
  ExternalLink,
  Shield,
  X,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { StudentReport } from '../types';
import Modal from '../components/Modal';

const API_BASE_URL = 'https://neet-pyq-admin-dashboard-3.onrender.com';

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [issueFilter, setIssueFilter] = useState<string>('all');

  // Active Report Details Modal
  const [selectedReport, setSelectedReport] = useState<StudentReport | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Manual Test Report Modal
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newQuestionId, setNewQuestionId] = useState('');
  const [newIssueType, setNewIssueType] = useState('Incorrect answer key');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Deletion Modal
  const [deletingReport, setDeletingReport] = useState<StudentReport | null>(null);

  const fetchReports = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const endpoints = [
      `${API_BASE_URL}/api/admin/reports`,
      `${API_BASE_URL}/admin/reports`,
      `${API_BASE_URL}/api/admin/flagged-questions`
    ];

    let response: Response | null = null;

    try {
      setLoading(true);
      setError('');

      for (const url of endpoints) {
        try {
          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.status !== 404) {
            response = res;
            break;
          }
        } catch (e) {
          console.warn(`Attempt failed for ${url}:`, e);
        }
      }

      if (!response) {
        setReports([]);
        setLoading(false);
        return;
      }

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setReports(data.reports || data.flags || []);
      } else {
        setError(data.message || 'Failed to fetch student reports');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [navigate]);

  const handleUpdateStatus = async (reportId: string, newStatus: string, noteToSave?: string, updatedQ?: any) => {
    const token = localStorage.getItem('adminToken');
    try {
      setIsUpdating(true);

      const res = await fetch(`${API_BASE_URL}/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          admin_note: noteToSave !== undefined ? noteToSave : adminNote,
          update_question: updatedQ
        })
      });

      const data = await res.json();

      if (res.ok) {
        const shortId = String(reportId).slice(-6);
        setSuccessMsg(`Report #${shortId} updated to "${newStatus}"`);
        setSelectedReport(null);
        
        // Refresh directly from database after confirmed update
        await fetchReports();
      } else {
        setError(data.detail || data.message || 'Failed to update report status in database');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while updating report status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateManualReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIssueType || !newDescription) {
      setError('Issue type and description are required.');
      return;
    }

    const token = localStorage.getItem('adminToken');
    try {
      setIsSubmittingReport(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          student_email: newStudentEmail || 'student@neetstudent.com',
          question_id: newQuestionId || null,
          issue_type: newIssueType,
          description: newDescription,
          status: 'pending'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('New report logged successfully.');
        setIsNewReportModalOpen(false);
        setNewStudentEmail('');
        setNewQuestionId('');
        setNewIssueType('Incorrect answer key');
        setNewDescription('');
        fetchReports();
      } else {
        setError(data.message || 'Failed to log report');
      }
    } catch (err) {
      console.error(err);
      setError('Error submitting new report');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!deletingReport) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reports/${deletingReport.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setSuccessMsg('Report deleted successfully');
        setDeletingReport(null);
        fetchReports();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete report');
      }
    } catch (err) {
      console.error(err);
      setError('Error deleting report');
    }
  };

  const navigateToQuestion = (report: StudentReport) => {
    const targetKey =
      report.question_details?.id ||
      report.question_details?.question_number ||
      report.question_id ||
      '';

    navigate(`/admin/questions?search=${encodeURIComponent(targetKey)}`);
  };

  // Stats
  const totalCount = reports.length;
  const pendingCount = reports.filter((r) => r.status === 'pending').length;
  const inReviewCount = reports.filter((r) => r.status === 'in_review').length;
  const resolvedCount = reports.filter((r) => r.status === 'resolved').length;
  const dismissedCount = reports.filter((r) => r.status === 'dismissed').length;

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      (r.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.student_email || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.question_id && String(r.question_id).toLowerCase().includes(search.toLowerCase())) ||
      (r.id || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesIssue = issueFilter === 'all' || r.issue_type === issueFilter;

    return matchesSearch && matchesStatus && matchesIssue;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="h-3.5 w-3.5" />
            Pending Review
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            In Review
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-3.5 w-3.5" />
            Resolved
          </span>
        );
      case 'dismissed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20">
            <XCircle className="h-3.5 w-3.5" />
            Dismissed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-2.5">
            <AlertCircle className="h-6 w-6 text-amber-500" />
            Student Issue & Question Reports
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Review reported question errors, typo feedback, and website issue tickets submitted by NEET students.
          </p>
        </div>

        <button
          onClick={() => setIsNewReportModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" />
          Log Manual Report
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center justify-between text-xs text-red-700 dark:text-red-400 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-800 dark:border-neutral-200 shadow-md scale-[1.02]'
              : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">Total</span>
            <MessageSquare className="h-4 w-4 opacity-70" />
          </div>
          <p className="text-2xl font-black mt-2">{totalCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02]'
              : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">Pending</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-amber-600 dark:text-amber-400">{pendingCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('in_review')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'in_review'
              ? 'bg-blue-600 text-white border-blue-700 shadow-md scale-[1.02]'
              : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-800 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">In Review</span>
            <Loader2 className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-blue-600 dark:text-blue-400">{inReviewCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('resolved')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'resolved'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-[1.02]'
              : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">Resolved</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">{resolvedCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter('dismissed')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === 'dismissed'
              ? 'bg-neutral-700 text-white border-neutral-800 shadow-md scale-[1.02]'
              : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">Dismissed</span>
            <XCircle className="h-4 w-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-black mt-2 text-neutral-500">{dismissedCount}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search report text, email, question ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-900 dark:text-neutral-100"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg text-xs shrink-0">
            <span className="text-[10px] font-bold text-neutral-400 px-2 uppercase">Status:</span>
            {['all', 'pending', 'in_review', 'resolved', 'dismissed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <select
            value={issueFilter}
            onChange={(e) => setIssueFilter(e.target.value)}
            className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border-0 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Issue Categories</option>
            <option value="Incorrect answer key">Incorrect answer key</option>
            <option value="Typo or wording issue">Typo or wording issue</option>
            <option value="Image missing">Image missing / Broken render</option>
            <option value="Out of syllabus">Out of syllabus</option>
            <option value="App bug / technical issue">App bug / Technical</option>
            <option value="General Issue">General Issue</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs text-neutral-500">Loading student reports queue...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="h-10 w-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">No reports match filter criteria</h3>
            <p className="text-xs text-neutral-400 mt-1">Select another filter or log a test report.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-4 hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {getStatusBadge(report.status)}

                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-bold text-neutral-700 dark:text-neutral-300 text-[11px]">
                      {report.issue_type}
                    </span>

                    {report.question_id && (
                      <button
                        onClick={() => navigateToQuestion(report)}
                        className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 font-mono text-[11px] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                        title="Click to view question in catalog"
                      >
                        <FileQuestion className="h-3 w-3" />
                        Target Q-ID: {report.question_id}
                        {report.question_details?.year && ` (NEET ${report.question_details.year})`}
                      </button>
                    )}

                    <span className="text-[11px] text-neutral-400 font-mono">
                      {report.timestamp ? new Date(report.timestamp).toLocaleString() : 'N/A'}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 leading-relaxed bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg border border-neutral-200/60 dark:border-neutral-800">
                    "{report.description}"
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3 text-neutral-400" />
                      Reported by: <strong className="text-neutral-700 dark:text-neutral-300">{report.student_email}</strong>
                    </span>

                    {report.admin_note && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 italic">
                        <Shield className="h-3 w-3" />
                        Admin note: {report.admin_note}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => {
                      setSelectedReport(report);
                      setAdminNote(report.admin_note || '');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Review & Respond
                  </button>

                  <button
                    onClick={() => setDeletingReport(report)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Delete report entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REVIEW & RESPOND MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-2xl w-full p-6 border border-neutral-200 dark:border-neutral-800 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Manage Student Report #{selectedReport.id ? String(selectedReport.id).slice(-6) : 'N/A'}
            </h3>

            <div className="mt-4 space-y-4 text-xs">
              <div className="bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">{selectedReport.issue_type}</span>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed bg-white dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                  "{selectedReport.description}"
                </p>
                <p className="text-neutral-400 text-[11px]">
                  Submitted by: <strong>{selectedReport.student_email}</strong> on {selectedReport.timestamp ? new Date(selectedReport.timestamp).toLocaleString() : 'N/A'}
                </p>
              </div>

              {/* LIVE TARGET QUESTION CARD */}
              {selectedReport.question_id && (
                <div className="bg-emerald-50/20 dark:bg-neutral-800/80 p-4 rounded-xl border border-emerald-500/30 dark:border-emerald-500/20 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-700 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-black text-xs">
                        Question No: Q{selectedReport.question_details?.question_number || selectedReport.question_id}
                      </span>
                      {selectedReport.question_details?.year && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
                          Year: NEET {selectedReport.question_details.year}
                        </span>
                      )}
                      {selectedReport.question_details?.subject && (
                        <span className="text-neutral-500 font-semibold text-xs">
                          {selectedReport.question_details.subject} • {selectedReport.question_details.chapter}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => navigateToQuestion(selectedReport)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      Jump to Question
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {selectedReport.question_details ? (
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs leading-relaxed">
                        {selectedReport.question_details.question}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 dark:text-neutral-400 mt-2">
                        <div>A: {selectedReport.question_details.option_a}</div>
                        <div>B: {selectedReport.question_details.option_b}</div>
                        <div>C: {selectedReport.question_details.option_c}</div>
                        <div>D: {selectedReport.question_details.option_d}</div>
                      </div>
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                        Correct Answer: Option {selectedReport.question_details.correct_answer}
                      </p>
                    </div>
                  ) : (
                    <div className="text-neutral-400 text-xs flex items-center justify-between">
                      <span>Target Question ID: <strong>{selectedReport.question_id}</strong></span>
                      <button
                        onClick={() => navigateToQuestion(selectedReport)}
                        className="text-emerald-500 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      >
                        Open in Question Registry <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Resolution Form */}
              <div className="space-y-3 pt-2">
                <label className="block font-bold text-neutral-800 dark:text-neutral-200">
                  Update Resolution Status:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedReport.id, 'in_review')}
                    disabled={isUpdating}
                    className="py-2 px-3 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-500/20 transition-colors cursor-pointer"
                  >
                    Mark In Review
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                    disabled={isUpdating}
                    className="py-2 px-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedReport.id, 'dismissed')}
                    disabled={isUpdating}
                    className="py-2 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                  >
                    Dismiss Report
                  </button>
                </div>

                <div className="pt-2">
                  <label className="block font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                    Admin Notes / Investigation Comments:
                  </label>
                  <textarea
                    rows={3}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="e.g., Verified explanation with NCERT biology textbook. Correct option B confirmed."
                    className="w-full p-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-400 font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedReport.id, selectedReport.status, adminNote)}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer"
                >
                  {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Admin Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Report Creation Modal */}
      {isNewReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 rounded-xl max-w-md w-full p-6 border border-neutral-200 dark:border-neutral-800 shadow-xl relative">
            <button
              onClick={() => setIsNewReportModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Log Manual Student Report
            </h3>

            <form onSubmit={handleCreateManualReport} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Student Email Address</label>
                <input
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="student@neetstudent.com"
                  className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Question ID (Optional)</label>
                <input
                  type="text"
                  value={newQuestionId}
                  onChange={(e) => setNewQuestionId(e.target.value)}
                  placeholder="e.g. 605"
                  className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Issue Category *</label>
                <select
                  value={newIssueType}
                  onChange={(e) => setNewIssueType(e.target.value)}
                  className="w-full p-2 bg-neutral-50 dark:bg-neutral-800 border rounded-lg font-medium"
                >
                  <option value="Incorrect answer key">Incorrect answer key</option>
                  <option value="Typo or wording issue">Typo or wording issue</option>
                  <option value="Image missing">Image missing / Broken render</option>
                  <option value="Out of syllabus">Out of syllabus</option>
                  <option value="App bug / technical issue">App bug / Technical</option>
                  <option value="General Issue">General Issue</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Detailed Feedback / Report *</label>
                <textarea
                  rows={3}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the question error or issue reported by the candidate..."
                  className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-800 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewReportModalOpen(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-2"
                >
                  {isSubmittingReport && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingReport}
        onClose={() => setDeletingReport(null)}
        onConfirm={handleDeleteReport}
        title="Delete Report Entry"
        message={`Are you sure you want to permanently delete this report entry #${deletingReport?.id ? String(deletingReport.id).slice(-6) : ''}? This action cannot be undone.`}
        confirmText="Delete Report"
        cancelText="Cancel"
        isDanger={true}
      />
    </div>
  );
}