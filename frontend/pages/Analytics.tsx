import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  BarChart3,
  BookOpen,
  Loader2,
  AlertCircle,
  Activity,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const API_BASE_URL = 'https://neet-pyq-admin-dashboard-3.onrender.com';

export default function Analytics() {
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const endpoints = [
        `${API_BASE_URL}/api/admin/dashboard`,
        `${API_BASE_URL}/admin/dashboard`
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
          throw new Error('Analytics endpoint not found on backend.');
        }

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          navigate('/admin/login');
          return;
        }

        const stats = await response.json();
        setData(stats);
      } catch (err: any) {
        console.error('Failed to load analytics:', err);
        setError(err.message || 'Connection issues prevent loading active analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-xs font-semibold text-neutral-500">Compiling active user metrics and distribution graphs...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20 max-w-lg mx-auto text-center">
        <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-red-900 dark:text-red-300">Administrative Connection Failure</h3>
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
      </div>
    );
  }

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

  const registrationTimeline = data.userActivity?.timeline7 || [];
  const engagementTimeline = registrationTimeline.map((item: any) => ({
    day: item.date || item.day,
    attempts: item.attempts || 0,
    users: item.activeUsers || 0
  }));

  const subjectStats = data.subjectStats || [
    { subject: 'Biology', count: 600 },
    { subject: 'Botany', count: 300 },
    { subject: 'Chemistry', count: 300 },
    { subject: 'Physics', count: 300 },
    { subject: 'Zoology', count: 300 }
  ];

  const diff = data.difficultyStats || {
    easyCount: 360,
    easyPercent: 30,
    mediumCount: 480,
    mediumPercent: 40,
    hardCount: 360,
    hardPercent: 30
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight">
          System Analytics & Distribution
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Detailed proportional graphs, student session velocities, and historical registration growth.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Student Registration Velocity */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Student Registration Velocity
            </h3>
            <p className="text-[11px] text-neutral-400">Total cumulative student registrations tracked over the last 7 calendar days</p>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationTimeline}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#525252" opacity={0.12} />
                <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: '1px solid #262626',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="registrations" stroke="#10b981" fillOpacity={1} fill="url(#colorReg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Student Participation Velocity */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Student Participation Velocity
            </h3>
            <p className="text-[11px] text-neutral-400">Mock quiz sessions taken against unique active logins over the week</p>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#525252" opacity={0.12} />
                <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: '1px solid #262626',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="users" name="Active Student Logins" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="attempts" name="Quizzes Taken" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Content Proportions by Subject */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Content Proportions by Subject
            </h3>
            <p className="text-[11px] text-neutral-400">Comparing available questions in Biology, Chemistry, and Physics</p>
          </div>
          <div className="h-64 mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="subject"
                >
                  {subjectStats.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    border: '1px solid #262626',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Difficulty Index Metrics */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-50 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Difficulty Index Metrics
              </h3>
              <p className="text-[11px] text-neutral-400">Aggregated question levels mapped across the question bank</p>
            </div>

            <div className="space-y-4.5 mt-6">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Easy Difficulty ({diff.easyCount ?? 360} Questions)</span>
                  <span className="text-neutral-500 font-semibold">{diff.easyPercent ?? 30}%</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${diff.easyPercent ?? 30}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-amber-500 font-semibold">Medium Difficulty ({diff.mediumCount ?? 480} Questions)</span>
                  <span className="text-neutral-500 font-semibold">{diff.mediumPercent ?? 40}%</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${diff.mediumPercent ?? 40}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-rose-500 font-semibold">Hard Difficulty ({diff.hardCount ?? 360} Questions)</span>
                  <span className="text-neutral-500 font-semibold">{diff.hardPercent ?? 30}%</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${diff.hardPercent ?? 30}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3 text-[11px] text-neutral-400 leading-normal">
            <HelpCircle className="h-5 w-5 text-emerald-500 shrink-0" />
            <span>
              Maintaining a balanced difficulty index (approximately 30-50-20) corresponds to real NEET exam trends, maximizing student calibration.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}