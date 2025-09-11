import React from 'react';
import { X } from 'lucide-react';

const ResultDetailModal: React.FC<{ result: any; onClose: () => void }> = ({ result, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Test Result Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* AI Analysis */}
          {result.aiAnalysis && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Analysis</h3>
              <p className="text-gray-700">{result.aiAnalysis.summary}</p>
              {result.aiAnalysis.recommendations?.length > 0 && (
                <ul className="list-disc list-inside space-y-1 mt-3">
                  {result.aiAnalysis.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-gray-700">{rec}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Product Page Tests */}
          {result.results?.productPageTests?.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Page Tests</h3>
              <div className="space-y-4">
                {result.results.productPageTests.map((test: any, i: number) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900 truncate">{test.url}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        test.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {test.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Detection */}
          {result.results?.errorDetection && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Error Detection</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">JavaScript Errors</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {result.results.errorDetection?.jsErrors?.length || 0}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900 mb-2">Network Errors</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    {result.results.errorDetection?.networkErrors?.length || 0}
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">Console Warnings</h4>
                  <p className="text-2xl font-bold text-yellow-600">
                    {result.results.errorDetection?.consoleWarnings?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDetailModal;
