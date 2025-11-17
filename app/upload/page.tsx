'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/FileUpload';
import RubricSelector from '@/components/RubricSelector';
import { RubricConfig } from '@/lib/supabase/types';
import { Loader2 } from 'lucide-react';

interface ParsedItem {
  prompt: string;
  expected_output?: string;
  model_output: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [rubric, setRubric] = useState<RubricConfig | null>(null);
  const [evaluationName, setEvaluationName] = useState('');
  const [modelVersion, setModelVersion] = useState('');
  const [threshold, setThreshold] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!evaluationName.trim()) {
      setError('Please enter an evaluation name');
      return;
    }

    if (items.length === 0) {
      setError('Please upload a dataset');
      return;
    }

    if (!rubric) {
      setError('Please select a rubric');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/evaluations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: evaluationName,
          rubric,
          threshold: threshold ? parseFloat(threshold) : null,
          model_version: modelVersion || null,
          items,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create evaluation');
      }

      // Redirect to evaluation page
      router.push(`/evaluation/${data.evaluation_id}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Evaluation
          </h1>
          <p className="text-gray-600 mb-8">
            Upload your dataset and configure evaluation criteria
          </p>

          <div className="space-y-6">
            {/* Evaluation Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evaluation Name *
              </label>
              <input
                type="text"
                value={evaluationName}
                onChange={(e) => setEvaluationName(e.target.value)}
                placeholder="e.g., GPT-4 vs GPT-3.5 Math Test"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Model Version */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Version (optional)
              </label>
              <input
                type="text"
                value={modelVersion}
                onChange={(e) => setModelVersion(e.target.value)}
                placeholder="e.g., v1.0.0, gpt-4-turbo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dataset *
              </label>
              <FileUpload onDataParsed={setItems} />
              {items.length > 0 && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ {items.length} items loaded
                </p>
              )}
            </div>

            {/* Rubric Selector */}
            <RubricSelector onRubricChange={setRubric} />

            {/* Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pass Threshold (optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="e.g., 0.8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                Minimum average score required to pass (for CI/CD integration)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Creating Evaluation...
                </>
              ) : (
                'Start Evaluation'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

