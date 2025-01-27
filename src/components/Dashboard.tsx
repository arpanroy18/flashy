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
  Cell
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

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-dashboard-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Book className="text-dashboard-accent" size={24} />
              </div>
              <h3 className="text-dashboard-text-primary font-semibold">Today's Progress</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-dashboard-text-secondary">Cards Due</span>
                <span className="text-dashboard-text-primary font-bold">{dueCards}</span>
              </div>
              <div className="w-full bg-dashboard-bg rounded-full h-2">
                <div
                  className="bg-dashboard-accent rounded-full h-2"
                  style={{ width: `${Math.min((stats.cardsStudied / stats.totalCards) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-dashboard-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Activity className="text-dashboard-success" size={24} />
              </div>
              <h3 className="text-dashboard-text-primary font-semibold">Study Streak</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-dashboard-text-primary">{stats.streak}</span>
              <span className="text-dashboard-text-secondary">days</span>
            </div>
          </div>

          <div className="bg-dashboard-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Target className="text-dashboard-warning" size={24} />
              </div>
              <h3 className="text-dashboard-text-primary font-semibold">Total Cards</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-dashboard-text-primary">{stats.totalCards}</span>
              <span className="text-dashboard-text-secondary">cards</span>
            </div>
          </div>

          <div className="bg-dashboard-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Trophy className="text-purple-500" size={24} />
              </div>
              <h3 className="text-dashboard-text-primary font-semibold">Total Decks</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-dashboard-text-primary">{totalDecks}</span>
              <span className="text-dashboard-text-secondary">decks</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Study Hours Chart */}
          <div className="bg-dashboard-card p-6 rounded-xl">
            <h3 className="text-dashboard-text-primary font-semibold mb-6">Study History</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.studyHistory}>
                  <XAxis
                    dataKey="date"
                    stroke="#94A3B8"
                    fontSize={12}
                  />
                  <YAxis
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
                  <Bar
                    dataKey="hours"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Distribution */}
          <div className="bg-dashboard-card p-6 rounded-xl">
            <h3 className="text-dashboard-text-primary font-semibold mb-6">Deck Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.subjectDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.subjectDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={['#3B82F6', '#22C55E', '#F59E0B', '#60A5FA'][index % 4]}
                      />
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
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {stats.subjectDistribution.map((subject, index) => (
                  <div key={subject.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: ['#3B82F6', '#22C55E', '#F59E0B', '#60A5FA'][index % 4] }}
                    />
                    <span className="text-dashboard-text-secondary text-sm">
                      {subject.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}