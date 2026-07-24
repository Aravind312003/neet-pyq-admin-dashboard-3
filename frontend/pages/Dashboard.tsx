import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Users as UsersIcon,
  CheckCircle,
  AlertOctagon,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  Loader2,
  Activity,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';

const API_BASE_URL = 'https://neet-pyq-admin-dashboard-3.onrender.com';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'dropoff' | 'performance'>('overview');
  const [timelineDays, setTimelineDays] = useState<7 | 30 | 90>(7);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          navigate('/admin/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Server returned error details');
        }

        const analytics = await response.json();
        setData(analytics);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to retrieve live administrative analytics.');
      } font-semibold {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm font-semibold text-neutral-500">Retrieving system stats and analytics ledger...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20 max-w-lg mx-auto text-center">
        <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-red-900 dark:text-red-300">Administrative Connection Failure</h3>
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error || 'An error has occurred.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'];

  const activeTimeline = 
    timelineDays === 7 
      ? data.userActivity?.timeline7 
      : timelineDays === 30 
        ? data.userActivity?.timeline30 
        : data.userActivity?.timeline90;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
            Overview Dashboard
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Real-time insights, core academic metrics, and active student trends.
          </p>
        </div>

        <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 self-start sm:self-center">
          {(['overview', 'activity', 'dropoff', 'performance'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              {tab === 'dropoff' ? 'Test Drop-Off' : tab === 'performance' ? 'Performance Heatmap' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link 
          to="/admin/questions"
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs relative overflow-hidden hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md group block transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider group-hover:text-emerald-500 transition-colors duration-200">Total Questions</p>
              <h3 className="text-2xl font-black text-neutral-900 dark:text-neutral-50 mt-1.5">
                {data.totalQuestions}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-neutral-400 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-emerald-500 font-semibold">Active</span> catalog content
          </div>
        </Link>

        <Link 
          to="/admin/users"
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs relative overflow-hidden hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md group block transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider group-hover:text-teal-500 transition-colors duration-200">Registered Students</p>
              <h3 className="text-2xl font-black text-neutral-900 dark:text-neutral-50 mt-1.5">
                {data.totalUsers}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-all duration-300">
              <UsersIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-neutral-400 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-emerald-500 font-semibold">Real</span> client database
          </div>
        </Link>

        <Link 
          to="/admin/analytics"
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs relative overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md group block transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider group-hover:text-blue-500 transition-colors duration-200">Active Today (DAU)</p>
              <h3 className="text-2xl font-black text-neutral-900 dark:text-neutral-50 mt-1.5">
                {data.activeUsers24h}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-neutral-400 flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-blue-500 font-semibold">Dynamic</span> login metrics
          </div>
        </Link>

        <Link 
          to="/admin/tests"
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs relative overflow-hidden hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md group block transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider group-hover:text-indigo-500 transition-colors duration-200">Completed Sessions</p>
              <h3 className="text-2xl font-black text-neutral-900 dark:text-neutral-50 mt-1.5">
                {data.testsAttempted}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
              <AlertOctagon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-neutral-400 flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-indigo-500 font-semibold">Test submissions</span> stored
          </div>
        </Link>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-50">Questions per Subject</h3>
                  <p className="text-[11px] text-neutral-400">Total volume of questions parsed under each major NEET criteria</p>
                </div>
              </div>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.subjectStats} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#525252" opacity={0.15} />
                    <XAxis dataKey="subject" stroke="#888888" fontSize={11} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        border: '1px solid #262626',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]}>
                      {data.subjectStats.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-50">Questions per Year</h3>
                  <p className="text-[11px] text-neutral-400">Database proportion classified by question year</p>
                </div>
              </div>
              <div className="h-48 mt-6 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.yearStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="year"
                    >
                      {data.yearStats.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        border: '1px solid #262626',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {data.yearStats.map((stat: any, i: number) => (
                  <div key={stat.year} className="flex items-center gap-1.5 text-neutral-500 truncate">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{stat.year}:</span> {stat.count}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}