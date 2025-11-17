'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  Loader2, 
  Plus, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock 
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Evaluation {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  average_score: number | null;
  threshold: number | null;
  model_version: string | null;
  total_items: number;
  completed_items: number;
  created_at: string;
}

export default function HistoryPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const response = await fetch('/api/evaluations/list');
      if (!response.ok) {
        throw new Error('Failed to fetch evaluations');
      }
      const data = await response.json();
      setEvaluations(data.evaluations);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-700',
      running: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  // Prepare trend data
  const trendData = evaluations
    .filter(e => e.status === 'completed' && e.average_score !== null)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(e => ({
      name: e.model_version || format(new Date(e.created_at), 'MM/dd'),
      score: e.average_score,
      threshold: e.threshold,
    }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Evaluation History
            </h1>
            <p className="text-gray-600">
              Track and compare your model evaluations over time
            </p>
          </div>
          <Link
            href="/upload"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus className="h-5 w-5" />
            New Evaluation
          </Link>
        </div>

        {/* Trend Chart */}
        {trendData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Performance Trend
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Average Score"
                />
                {trendData[0]?.threshold && (
                  <Line 
                    type="monotone" 
                    dataKey="threshold" 
                    stroke="#ef4444" 
                    strokeDasharray="5 5"
                    name="Threshold"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Evaluations List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {error ? (
            <div className="p-8 text-center text-red-600">
              {error}
            </div>
          ) : evaluations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-4">No evaluations yet</p>
              <Link
                href="/upload"
                className="text-blue-600 hover:underline"
              >
                Create your first evaluation
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Model Version
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Avg Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Pass/Fail
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {evaluations.map((evaluation) => {
                    const passed = evaluation.threshold !== null && evaluation.average_score !== null
                      ? evaluation.average_score >= evaluation.threshold
                      : null;

                    return (
                      <tr key={evaluation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <Link
                            href={`/evaluation/${evaluation.id}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {evaluation.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {evaluation.model_version || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(evaluation.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(evaluation.status)}`}>
                              {evaluation.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {evaluation.completed_items} / {evaluation.total_items}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {evaluation.average_score !== null ? (
                            <span className={
                              evaluation.average_score >= 0.7 
                                ? 'text-green-600' 
                                : evaluation.average_score >= 0.4 
                                ? 'text-yellow-600' 
                                : 'text-red-600'
                            }>
                              {evaluation.average_score.toFixed(3)}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          {passed === null ? (
                            <span className="text-gray-400">—</span>
                          ) : passed ? (
                            <span className="text-green-600">PASS</span>
                          ) : (
                            <span className="text-red-600">FAIL</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {format(new Date(evaluation.created_at), 'PPp')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

