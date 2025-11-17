import Link from 'next/link';
import { BarChart3, Upload, History, GitCompare } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Evaluation as a Service
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Automated LLM evaluation platform with batch scoring, trend tracking, and CI/CD integration
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Link href="/upload" className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Create Evaluation
              </h2>
            </div>
            <p className="text-gray-600">
              Upload your dataset, select evaluation criteria, and start automated scoring with LLM judges or metrics like BLEU and ROUGE.
            </p>
          </Link>

          <Link href="/history" className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <History className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                View History
              </h2>
            </div>
            <p className="text-gray-600">
              Track all your evaluations, view detailed results, and monitor performance trends across model versions.
            </p>
          </Link>

          <Link href="/compare" className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <GitCompare className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Compare Evaluations
              </h2>
            </div>
            <p className="text-gray-600">
              Side-by-side comparison of evaluation runs to identify improvements and regressions across model versions.
            </p>
          </Link>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                CI/CD Integration
              </h2>
            </div>
            <p className="text-gray-600">
              Integrate evaluations into your deployment pipeline with API endpoints and automated pass/fail thresholds.
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            Key Features
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-1 rounded mt-1">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">LLM-based Judges</h4>
                <p className="text-sm text-gray-600">Use GPT-4 or Claude to evaluate outputs</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-1 rounded mt-1">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Automated Metrics</h4>
                <p className="text-sm text-gray-600">BLEU, ROUGE, and semantic similarity</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-1 rounded mt-1">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Batch Processing</h4>
                <p className="text-sm text-gray-600">Evaluate hundreds of examples at once</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-1 rounded mt-1">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Trend Visualization</h4>
                <p className="text-sm text-gray-600">Track performance over time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
