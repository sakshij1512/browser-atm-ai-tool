import React, { useEffect, useState, useMemo } from 'react';
import { BarChart3, Download, X, Search } from 'lucide-react';

interface Configuration {
  _id: string;
  name: string;
  targetUrl: string;
  platform: string;
}

interface TestResult {
  _id: string;
  executionId: string;
  status: string;
  startTime: string;
  results: {
    productPageTests: any[];
    imageValidation: any[];
    errorDetection: {
      jsErrors: string[];
      networkErrors: string[];
      consoleWarnings: string[];
    };
  };
  aiAnalysis: {
    recommendations: string[];
  };
  screenshots: string[];
  configurationId: Configuration;
}

const Reports: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllResults = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/tests/results/all?limit=10000`);
      const data = await res.json();
      // Increase limit as per your dataset
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if an image has issues
  const hasImageIssues = (img: any) => {
    return (
      !img.loaded || // Image failed to load
      img.status !== 200 || // HTTP error status
      !img.altText || // Missing alt text
      img.altText.trim() === '' || // Empty alt text
      (img.errors && img.errors.length > 0) // Has specific errors
    );
  };

  // Filter images to show only problematic ones
  const getProblematicImages = (imageValidation: any[]) => {
    return imageValidation.filter(hasImageIssues);
  };

  // Filter results based on search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return results;
    
    const query = searchQuery.toLowerCase().trim();
    
    return results.filter((result) => {
      // Search in execution ID
      if (result.executionId?.toLowerCase().includes(query)) return true;
      
      // Search in configuration name
      if (result.configurationId?.name?.toLowerCase().includes(query)) return true;
      
      // Search in target URL
      if (result.configurationId?.targetUrl?.toLowerCase().includes(query)) return true;
      
      // Search in platform
      if (result.configurationId?.platform?.toLowerCase().includes(query)) return true;
      
      // Search in status
      if (result.status?.toLowerCase().includes(query)) return true;
      
      // Search in start time (formatted date)
      if (new Date(result.startTime).toLocaleString().toLowerCase().includes(query)) return true;
      
      return false;
    });
  }, [results, searchQuery]);

  useEffect(() => {
    fetchAllResults();
  }, []);

  const exportResults = () => {
  if (!results || results.length === 0) return;

  // Convert results to JSON string
  const dataStr = JSON.stringify(results, null, 2); // pretty-print with 2 spaces
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Create temporary download link
  const link = document.createElement("a");
  link.href = url;
  link.download = `test-results-${new Date().toISOString()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Detailed insights and performance trends</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors" onClick={exportResults}>
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="my-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by execution ID, configuration, URL, platform, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-600">
            Showing {filteredResults.length} of {results.length} results
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
  {loading ? (
    <p className="text-center py-8">Loading results...</p>
  ) : error ? (
    <p className="text-center py-8 text-red-500">{error}</p>
  ) : filteredResults.length === 0 ? (
    <p className="text-center py-8 text-gray-500">
      {searchQuery ? `No test results found matching "${searchQuery}"` : "No test results found"}
    </p>
  ) : (
    <div className="overflow-x-auto">   {/* <-- Added wrapper */}
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-2">Execution ID</th>
            <th className="px-4 py-2">Configuration</th>
            <th className="px-4 py-2">Target URL</th>
            <th className="px-4 py-2">Platform</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Start Time</th>
          </tr>
        </thead>
        <tbody>
          {filteredResults.map((r) => (
            <tr
              key={r._id}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedResult(r)}
            >
              <td className="px-4 py-2 font-mono">{r.executionId}</td>
              <td className="px-4 py-2">{r.configurationId?.name || '-'}</td>
              <td className="px-4 py-2">{r.configurationId?.targetUrl}</td>
              <td className="px-4 py-2">{r.configurationId?.platform}</td>
              <td
                className={`px-4 py-2 font-medium ${
                  r.status === 'passed'
                    ? 'text-green-600'
                    : r.status === 'failed'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`}
              >
                {r.status}
              </td>
              <td className="px-4 py-2">
                {new Date(r.startTime).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>


      {/* Modal for detailed test result */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start overflow-auto z-50 pt-4 pb-4">
          <div className="bg-white rounded-lg w-11/12 max-w-6xl p-6 relative max-h-full overflow-y-auto">
            <button
              className="absolute top-4 right-4 z-10"
              onClick={() => setSelectedResult(null)}
            >
              <X className="h-6 w-6" />
            </button>

            <div className="pr-8">
              <h3 className="text-2xl font-bold mb-6">Detailed Test Report</h3>
              
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <p><strong>Execution ID:</strong> <span className="font-mono text-sm">{selectedResult.executionId}</span></p>
                  <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-sm font-medium ${
                    selectedResult.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    selectedResult.status === 'failed' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>{selectedResult.status}</span></p>
                  <p><strong>Start Time:</strong> {new Date(selectedResult.startTime).toLocaleString()}</p>
                  {selectedResult.endTime && (
                    <p><strong>End Time:</strong> {new Date(selectedResult.endTime).toLocaleString()}</p>
                  )}
                  {selectedResult.duration && (
                    <p><strong>Duration:</strong> {(selectedResult.duration / 1000).toFixed(2)} seconds</p>
                  )}
                </div>
                <div className="space-y-2">
                  <p><strong>Configuration:</strong> {selectedResult.configurationId?.name || 'N/A'}</p>
                  <p><strong>Target URL:</strong> <a href={selectedResult.configurationId?.targetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{selectedResult.configurationId?.targetUrl}</a></p>
                  <p><strong>Platform:</strong> <span className="capitalize">{selectedResult.configurationId?.platform}</span></p>
                </div>
              </div>

              {/* AI Analysis Summary */}
              {selectedResult.aiAnalysis && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-lg mb-3 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    AI Analysis Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${
                        selectedResult.aiAnalysis.score >= 80 ? 'text-green-600' :
                        selectedResult.aiAnalysis.score >= 60 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {selectedResult.aiAnalysis.score}%
                      </div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xl font-semibold capitalize ${
                        selectedResult.aiAnalysis.riskLevel === 'low' ? 'text-green-600' :
                        selectedResult.aiAnalysis.riskLevel === 'medium' ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {selectedResult.aiAnalysis.riskLevel}
                      </div>
                      <div className="text-sm text-gray-600">Risk Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-semibold text-blue-600">
                        {selectedResult.aiAnalysis.recommendations.length}
                      </div>
                      <div className="text-sm text-gray-600">Recommendations</div>
                    </div>
                  </div>
                  <p className="text-gray-700">{selectedResult.aiAnalysis.summary}</p>
                </div>
              )}

              {/* Product Page Tests */}
              {selectedResult.results.productPageTests && selectedResult.results.productPageTests.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-3">Product Page Tests</h4>
                  {selectedResult.results.productPageTests.map((test, index) => (
                    <div key={test._id || index} className="border rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">Test #{index + 1}</p>
                          <p className="text-sm text-gray-600 break-all">{test.url}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          test.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {test.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="font-medium mb-2">Elements Status:</p>
                          <ul className="text-sm space-y-1">
                            <li>Title: <span className={test.elements.title.present ? 'text-green-600' : 'text-red-600'}>{test.elements.title.present ? 'Present' : 'Missing'}</span></li>
                            <li>Price: <span className={test.elements.price.present ? 'text-green-600' : 'text-red-600'}>{test.elements.price.present ? 'Present' : 'Missing'}</span></li>
                            <li>Add to Cart: <span className={test.elements.addToCart.present ? 'text-green-600' : 'text-red-600'}>{test.elements.addToCart.present ? 'Present' : 'Missing'}</span> {test.elements.addToCart.clickable && '(Clickable)'}</li>
                            <li>Description: <span className={test.elements.description.present ? 'text-green-600' : 'text-red-600'}>{test.elements.description.present ? 'Present' : 'Missing'}</span></li>
                            <li>Variants: <span className={test.elements.variants.present ? 'text-green-600' : 'text-red-600'}>{test.elements.variants.present ? `Present` : 'Missing'}</span></li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium mb-2">Performance:</p>
                          <ul className="text-sm space-y-1">
                            <li>Load Time: {test.performance.loadTime}ms</li>
                            <li>Time to Interactive: {test.performance.timeToInteractive}ms</li>
                          </ul>
                        </div>
                      </div>
                      
                      {test.elements.title.text && (
                        <div className="mb-2">
                          <p className="font-medium text-sm">Product Title:</p>
                          <p className="text-sm bg-gray-50 p-2 rounded">{test.elements.title.text}</p>
                        </div>
                      )}
                      
                      {test.errors && test.errors.length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium text-sm text-red-600 mb-1">Errors:</p>
                          <ul className="text-sm text-red-600 list-disc ml-4">
                            {test.errors.map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Image Validation - Only show problematic images */}
              {selectedResult.results.imageValidation && selectedResult.results.imageValidation.length > 0 && (
                <div className="mb-6">
                  {(() => {
                    const problematicImages = getProblematicImages(selectedResult.results.imageValidation);
                    const totalImages = selectedResult.results.imageValidation.length;
                    const goodImages = totalImages - problematicImages.length;
                    
                    return (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-lg">Image Validation</h4>
                          <div className="text-sm text-gray-600">
                            {goodImages > 0 && (
                              <span className="text-green-600 mr-4">✓ {goodImages} images OK</span>
                            )}
                            {problematicImages.length > 0 && (
                              <span className="text-red-600">⚠ {problematicImages.length} issues found</span>
                            )}
                          </div>
                        </div>
                        
                       {problematicImages.length > 0 ? (
  <div className="space-y-3 max-h-96 overflow-y-auto"> {/* added scroll */}
    {problematicImages.map((img, index) => {
      const originalIndex = selectedResult.results.imageValidation.findIndex(
        originalImg => originalImg === img
      );

      return (
        <div key={img._id || originalIndex} className="border rounded-lg p-4 bg-red-50 border-red-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium mb-2 text-red-800">
                Broken Image #{originalIndex + 1}
              </p>
              <ul className="text-sm space-y-1">
                <li>Status: <span className={img.loaded ? 'text-green-600' : 'text-red-600 font-medium'}>{img.loaded ? 'Loaded' : '❌ Failed to Load'}</span></li>
                <li>HTTP Status: <span className={img.status === 200 ? 'text-green-600' : 'text-red-600 font-medium'}>{img.status}</span></li>
                <li>Dimensions: {img.dimensions.width} x {img.dimensions.height}</li>
                <li>Alt Text: {
                  !img.altText || img.altText.trim() === '' ? 
                  <span className="text-red-600 font-medium">❌ Missing or Empty</span> : 
                  <span className="text-green-600">✓ Present</span>
                }</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Image Source:</p>
              <p className="text-sm bg-gray-50 p-2 rounded break-all">{img.src}</p>
            </div>
          </div>
          {img.errors && img.errors.length > 0 && (
            <div className="mt-3">
              <p className="font-medium text-sm text-red-600 mb-1">Specific Errors:</p>
              <div className="text-sm text-red-600 bg-red-100 p-2 rounded">
                {img.errors.map((error, i) => (
                  <div key={i} className="font-mono">{error}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    })}
  </div>
) : (
  <div className="text-center py-4 bg-green-50 border border-green-200 rounded-lg">
    <p className="text-green-700 font-medium">✓ All {totalImages} images are loading correctly with proper alt text</p>
  </div>
)}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Error Detection */}
              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-3">Error Detection</h4>
                
                {/* JavaScript Errors */}
                <div className="mb-4">
                  <h5 className="font-medium mb-2 text-red-600">
                    JavaScript Errors ({selectedResult.results.errorDetection.jsErrors?.length || 0})
                  </h5>
                  {selectedResult.results.errorDetection.jsErrors && selectedResult.results.errorDetection.jsErrors.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto"> {/* added scroll */}
                      {selectedResult.results.errorDetection.jsErrors.map((error, i) => (
                        <div key={error._id || i} className="bg-red-50 border border-red-200 p-3 rounded">
                          <p className="font-medium text-red-800">{error.message}</p>
                          <p className="text-sm text-red-600 font-mono mt-1">{error.source}</p>
                          <p className="text-xs text-red-500 mt-1">
                            {new Date(error.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-green-600 text-sm">No JavaScript errors detected</p>
                  )}
                </div>

                {/* Network Errors */}
                  <div className="mb-4">
                    <h5 className="font-medium mb-2 text-orange-600">
                      Network Errors ({selectedResult.results.errorDetection.networkErrors?.length || 0})
                    </h5>
                    {selectedResult.results.errorDetection.networkErrors && selectedResult.results.errorDetection.networkErrors.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto"> {/* added scroll */}
                        {selectedResult.results.errorDetection.networkErrors.map((error, i) => (
                          <div key={error._id || i} className="bg-orange-50 border border-orange-200 p-3 rounded">
                            <p className="font-medium text-orange-800">Status {error.status}</p>
                            <p className="text-sm text-orange-700 break-all">{error.url}</p>
                            {error.error && <p className="text-sm text-orange-600 mt-1">{error.error}</p>}
                            <p className="text-xs text-orange-500 mt-1">
                              {new Date(error.timestamp).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-green-600 text-sm">No network errors detected</p>
                    )}
                  </div>


                {/* Console Warnings */}
                <div className="mb-4">
                  <h5 className="font-medium mb-2 text-yellow-600">Console Warnings ({selectedResult.results.errorDetection.consoleWarnings?.length || 0})</h5>
                  {selectedResult.results.errorDetection.consoleWarnings && selectedResult.results.errorDetection.consoleWarnings.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedResult.results.errorDetection.consoleWarnings.map((warning, i) => (
                        <div key={warning._id || i} className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                          <p className="text-sm text-yellow-800">{warning.message}</p>
                          <p className="text-xs text-yellow-600 mt-1">
                            {new Date(warning.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-green-600 text-sm">No console warnings detected</p>
                  )}
                </div>
              </div>

              {/* AI Recommendations */}
              {selectedResult.aiAnalysis?.recommendations && (
                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-3">AI Recommendations</h4>
                  {selectedResult.aiAnalysis.recommendations.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedResult.aiAnalysis.recommendations.map((recommendation, i) => (
                        <li key={i} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                            {i + 1}
                          </span>
                          <span className="text-blue-800">{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-600">No specific recommendations available</p>
                  )}
                </div>
              )}

              {/* Screenshots */}
              {selectedResult.screenshots && selectedResult.screenshots.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-lg mb-3">Screenshots</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedResult.screenshots.map((src, i) => (
                      <div key={i} className="border rounded-lg overflow-hidden">
                        <img 
                          src={src} 
                          alt={`Screenshot ${i + 1}`} 
                          className="w-full h-auto" 
                        />
                        <div className="p-2 bg-gray-50 text-sm text-gray-600">
                          Screenshot {i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;