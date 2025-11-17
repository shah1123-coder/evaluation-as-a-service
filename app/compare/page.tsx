'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EvaluationItem {
  id: string;
  prompt: string;
  model_output: string;
  score: number | null;
  explanation: string | null;
}

interface Evaluation {
  id: string;
  name: string;
  average_score: number | null;
  model_version: string | null;
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const eval1Id = searchParams.get('eval1');
  const eval2Id = searchParams.get('eval2');

  const [eval1, setEval1] = useState<{ evaluation: Evaluation; items: EvaluationItem[] } | null>(null);
  const [eval2, setEval2] = useState<{ evaluation: Evaluation; items: EvaluationItem[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eval1Id && eval2Id) {
      fetchComparison();
    }
  }, [eval1Id, eval2Id]);

  const fetchComparison = async () => {
    try {
      const [res1, res2] = await Promise.all([
        fetch(`/api/evaluations/${eval1Id}`),
        fetch(`/api/evaluations/${eval2Id}`),
      ]);

      const data1 = await res1.json();
      const data2 = await res2.json();

      setEval1(data1);
      setEval2(data2);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching evaluations:', err);
      setLoading(false);
    }
  };

  if (loading || !eval1 || !eval2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading comparison...</p>
      </div>
    );
  }

  const scoreDelta = (eval2.evaluation.average_score || 0) - (eval1.evaluation.average_score || 0);
  const improved = scoreDelta > 0;
  const unchanged = Math.abs(scoreDelta) < 0.001;

  // Match items by prompt
  const comparisonItems = eval1.items.map((item1) => {
    const item2 = eval2.items.find((i) => i.prompt === item1.prompt);
    return {
      prompt: item1.prompt,
      score1: item1.score,
      score2: item2?.score || null,
      delta: item2?.score !== null && item1.score !== null 
        ? item2.score - item1.score 
        : null,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/history" className="text-blue-600 hover:underline flex items-center mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to History
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Evaluation Comparison
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Baseline</h3>
            <p className="text-xl font-bold text-gray-900 mb-1">
              {eval1.evaluation.name}
            </p>
            <p className="text-sm text-gray-500">
              {eval1.evaluation.model_version || 'No version'}
            </p>
            <p className="text-3xl font-bold text-blue-600 mt-4">
              {eval1.evaluation.average_score?.toFixed(3) || '—'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 flex items-center justify-center">
            <div className="text-center">
              {unchanged ? (
                <>
                  <Minus className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No Change</p>
                </>
              ) : improved ? (
                <>
                  <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    +{(scoreDelta * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Improvement</p>
                </>
              ) : (
                <>
                  <TrendingDown className="h-12 w-12 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">
                    {(scoreDelta * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Regression</p>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Comparison</h3>
            <p className="text-xl font-bold text-gray-900 mb-1">
              {eval2.evaluation.name}
            </p>
            <p className="text-sm text-gray-500">
              {eval2.evaluation.model_version || 'No version'}
            </p>
            <p className="text-3xl font-bold text-blue-600 mt-4">
              {eval2.evaluation.average_score?.toFixed(3) || '—'}
            </p>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Item-by-Item Comparison
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Prompt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Baseline Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    New Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Delta
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparisonItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                      {item.prompt}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.score1?.toFixed(3) || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.score2?.toFixed(3) || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {item.delta !== null ? (
                        <span className={
                          item.delta > 0 
                            ? 'text-green-600' 
                            : item.delta < 0 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                        }>
                          {item.delta > 0 ? '+' : ''}{item.delta.toFixed(3)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
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

