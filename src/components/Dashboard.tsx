import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  Trophy,
  Clock,
  Calendar,
  Activity,
  Target,
  Book,
  Award,
  TrendingUp
} from 'lucide-react';
import { Deck, StudyStats } from '../types';

interface DashboardProps {
  stats: StudyStats;
  decks: Deck[];
}

// Temporary data for demonstration
const tempStudyTrend = [
  { date: '2024-03-01', cards: 15, minutes: 25 },
  { date: '2024-03-02', cards: 22, minutes: 35 },
  { date: '2024-03-03', cards: 18, minutes: 30 },
  { date: '2024-03-04', cards: 25, minutes: 40 },
  { date: '2024-03-05', cards: 30, minutes: 45 },
  { date: '2024-03-06', cards: 28, minutes: 42 },
  { date: '2024-03-07', cards: 35, minutes: 50 },
];

const tempRetentionData = [
  { name: 'Excellent', value: 45, color: '#22C55E' },
  { name: 'Good', value: 30, color: '#3B82F6' },
  { name: 'Fair', value: 15, color: '#F59E0B' },
  { name: 'Needs Review', value: 10, color: '#EF4444' },
];

const tempSubjectProgress = [
  { subject: 'Math', completed: 85, total: 100 },
  { subject: 'Science', completed: 65, total: 80 },
  { subject: 'History', completed: 45, total: 60 },
  { subject: 'Language', completed: 55, total: 70 },
];

export function Dashboard({ stats, decks }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const greeting = `Good ${
    currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 18 ? 'afternoon' : 'evening'
  }`;

  const totalDecks = decks.length;
  const dueCards = decks.reduce((sum, deck) => 
    sum + deck.cards.filter(card => card.nextReview <= new Date()).length, 0
  );

  return (
    <div className="min-h-screen bg-dashboard-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-dashboard-text-primary text-2xl font-bold">
              {greeting}!
            </h1>
            <p className="text-dashboard-text-secondary">
              {format(currentTime, 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-dashboard-card p-3 rounded-lg">
            <Clock className="text-dashboard-text-accent" size={20} />
            <span className="text-dashboard-text-primary font-mono">
              {format(currentTime, 'HH:mm:ss')}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-dashboard-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Book className="text-blue-500" size={24} />
              </div>
              <h3 className="text-dashboard-text-primary font-semibold">Cards Due Today</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-4xl font-bold text-dashboard-text-primary">{dueCards}</span>
                <span className="text-sm text-green-500">+12% ↑</span>
              </div>
              <p className="text-dashboard-text-secondary text-sm">from {totalDecks} decks</p>
            </div>
          </div>

          <div className="bg-dashboard-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Activity className="text-green-500" size={24} />
              </div>
              <h3 className="text-dashboard-text-primary font-semibold">Study Streak</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-4xl font-bold text-dashboard-text-primary">7</span>
                <span className="text-sm text-green-500">Best: 15</span>
              </div>
              <p className="text-dashboard-text-secondary text-sm">days in a row</p>
            </div>
          </div>

          <div className="bg-dashboard-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Target className="text-yellow-500" size={24} />
              </div>
              <h3 className="text-dashboard-text-primary font-semibold">Retention Rate</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-4xl font-bold text-dashboard-text-primary">85%</span>
                <span className="text-sm text-green-500">+5% ↑</span>
              </div>
              <p className="text-dashboard-text-secondary text-sm">last 7 days</p>
            </div>
          </div>

          <div className="bg-dashboard-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Award className="text-purple-500" size={24} />
              </div>
              <h3 className="text-dashboard-text-primary font-semibold">Total Reviews</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-4xl font-bold text-dashboard-text-primary">173</span>
                <span className="text-sm text-green-500">+23% ↑</span>
              </div>
              <p className="text-dashboard-text-secondary text-sm">this week</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Study Trend Chart */}
          <div className="bg-dashboard-card p-6 rounded-xl">
            <h3 className="text-dashboard-text-primary font-semibold mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-500" />
              Study Trend
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tempStudyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                  <XAxis
                    dataKey="date"
                    stroke="#94A3B8"
                    fontSize={12}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke="#94A3B8"
                    fontSize={12}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#94A3B8"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#F8FAFC' }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="cards"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                    name="Cards Reviewed"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="minutes"
                    stroke="#22C55E"
                    strokeWidth={2}
                    dot={{ fill: '#22C55E' }}
                    name="Study Minutes"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Retention Distribution */}
          <div className="bg-dashboard-card p-6 rounded-xl">
            <h3 className="text-dashboard-text-primary font-semibold mb-6 flex items-center gap-2">
              <Activity size={20} className="text-green-500" />
              Retention Distribution
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tempRetentionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tempRetentionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#F8FAFC' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-dashboard-text-secondary">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Progress */}
          <div className="bg-dashboard-card p-6 rounded-xl lg:col-span-2">
            <h3 className="text-dashboard-text-primary font-semibold mb-6 flex items-center gap-2">
              <Target size={20} className="text-yellow-500" />
              Subject Progress
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tempSubjectProgress} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" horizontal={false} />
                  <XAxis type="number" stroke="#94A3B8" fontSize={12} />
                  <YAxis
                    dataKey="subject"
                    type="category"
                    stroke="#94A3B8"
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: 'none',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#F8FAFC' }}
                  />
                  <Bar
                    dataKey="completed"
                    fill="#3B82F6"
                    radius={[0, 4, 4, 0]}
                    name="Completed"
                  />
                  <Bar
                    dataKey="total"
                    fill="#1E293B"
                    radius={[0, 4, 4, 0]}
                    name="Total"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}