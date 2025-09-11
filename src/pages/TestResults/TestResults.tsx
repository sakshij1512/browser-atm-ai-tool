import React, { useEffect, useState } from 'react';
import { useTest } from '../../contexts/TestContext';
import { Clock, Download } from 'lucide-react';
import ResultsTable from './ResultsTable';
import ResultDetailModal from './ResultDetailModal';

const TestResults: React.FC = () => {
  const { state, actions } = useTest();
  const [selectedConfig, setSelectedConfig] = useState('all');
  const [selectedResult, setSelectedResult] = useState<any>(null);

  useEffect(() => {
    actions.loadResults();
  }, []);

  // filter results based on dropdown
  const filteredResults = selectedConfig === 'all' 
    ? state.results 
    : state.results.filter((r: any) => r.configurationId?._id === selectedConfig);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test Results</h2>
          <p className="text-gray-600">View and analyze your test execution results</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedConfig}
            onChange={(e) => setSelectedConfig(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Configurations</option>
            {state.configurations.map((config: any) => (
              <option key={config._id} value={config._id}>
                {config.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Table or Empty State */}
      {filteredResults.length > 0 ? (
        <ResultsTable results={filteredResults} onViewDetails={setSelectedResult} />
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No test results yet</h3>
          <p className="text-gray-500">
            {selectedConfig === 'all'
              ? 'Run some tests to see results and analysis here'
              : 'No results for this configuration yet'}
          </p>
        </div>
      )}

      {/* Modal */}
      {selectedResult && (
        <ResultDetailModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
};

export default TestResults;
