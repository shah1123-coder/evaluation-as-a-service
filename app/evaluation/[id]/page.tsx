'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, 
  Download, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';

interface EvaluationItem {
  id: string;
  prompt: string;
  expected_output: string | null;
  model_output: string;
  score: number | null;
  explanation: string | null;
  status: 'pending' | 'scored' | 'error';
  error_message: string | null;
}

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
  rubric: any;
}

export default function EvaluationPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [items, setItems] = useState<EvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'created'>('created');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchEvaluation();
    
    // Poll for updates if evaluation is pending or running
    const interval = setInterval(() => {
      if (evaluation?.status === 'pending' || evaluation?.status === 'running') {
        fetchEvaluation();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, evaluation?.status]);

  const fetchEvaluation = async () => {
    try {
      const response = await fetch(`/api/evaluations/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch evaluation');
      }
      const data = await response.json();
      setEvaluation(data.evaluation);
      setItems(data.items);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!items.length) return;

    const headers = ['Prompt', 'Expected Output', 'Model Output', 'Score', 'Explanation', 'Status'];
    const rows = items.map(item => [
      item.prompt,
      item.expected_output || '',
      item.model_output,
      item.score?.toString() || '',
      item.explanation || '',
      item.status,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-${id}.csv`;
    a.click();
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

  const filteredItems = items
    .filter(item => filterStatus === 'all' || item.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'score') {
        return (b.score || 0) - (a.score || 0);
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700">{error || 'Evaluation not found'}</p>
          <Link href="/history" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to History
          </Link>
        </div>
      </div>
    );
  }

  const passed = evaluation.threshold !== null && evaluation.average_score !== null
    ? evaluation.average_score >= evaluation.threshold
    : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/history" className="text-blue-600 hover:underline flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to History
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {evaluation.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Created {format(new Date(evaluation.created_at), 'PPp')}</span>
                  {evaluation.model_version && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {evaluation.model_version}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(evaluation.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(evaluation.status)}`}>
                  {evaluation.status}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{evaluation.total_items}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{evaluation.completed_items}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {evaluation.average_score !== null 
                    ? evaluation.average_score.toFixed(3) 
                    : '—'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Pass/Fail</p>
                <p className="text-2xl font-bold">
                  {passed === null ? (
                    <span className="text-gray-400">—</span>
                  ) : passed ? (
                    <span className="text-green-600">PASS</span>
                  ) : (
                    <span className="text-red-600">FAIL</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="created">Sort by Created</option>
              <option value="score">Sort by Score</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Items</option>
              <option value="scored">Scored</option>
              <option value="pending">Pending</option>
              <option value="error">Errors</option>
            </select>
          </div>

          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prompt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model Output</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Explanation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {item.prompt}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {item.model_output}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {item.score !== null ? (
                        <span className={item.score >= 0.7 ? 'text-green-600' : item.score >= 0.4 ? 'text-yellow-600' : 'text-red-600'}>
                          {item.score.toFixed(3)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                      {item.explanation || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

