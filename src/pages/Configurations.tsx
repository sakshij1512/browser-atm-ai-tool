import React, { useState } from 'react';
import { useTest } from '../contexts/TestContext';
import { Plus, Globe, Play, Edit, Trash2, Settings } from 'lucide-react';
import ConfigurationModal from '../components/ConfigurationModal';

const Configurations: React.FC = () => {
  const { state, actions } = useTest();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);

  const handleCreateConfig = () => {
    setEditingConfig(null);
    setIsModalOpen(true);
  };

  const handleEditConfig = (config: any) => {
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  const handleDeleteConfig = async (id: string) => {
    if (confirm('Are you sure you want to delete this configuration?')) {
      await actions.deleteConfiguration(id);
    }
  };

  const handleRunTest = async (configId: string) => {
    await actions.runTest(configId);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'shopify':
        return '🛍️';
      case 'bigcommerce':
        return '🏪';
      default:
        return '🌐';
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Test Configurations</h2>
          <p className="text-gray-600">Manage your ecommerce website test configurations</p>
        </div>
        <button
          onClick={handleCreateConfig}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Configuration</span>
        </button>
      </div>

      {/* Configurations Grid */}
      {state.configurations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.configurations.map((config: any) => (
            <div key={config._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getPlatformIcon(config.platform)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{config.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{config.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRunTest(config._id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Run Test"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditConfig(config)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Configuration"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteConfig(config._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Configuration"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                  <Globe className="h-4 w-4" />
                  <span className="truncate">{config.targetUrl}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {config.testTypes.productPageTest && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Product Pages
                    </span>
                  )}
                  {config.testTypes.imageValidation && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Image Validation
                    </span>
                  )}
                  {config.testTypes.errorDetection && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Error Detection
                    </span>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="p-6 bg-gray-50">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Pages:</span>
                    <span className="font-medium">{config.productPages?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timeout:</span>
                    <span className="font-medium">{config.testSettings.timeout / 1000}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">
                      {new Date(config.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {config.schedule.enabled && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        Scheduled {config.schedule.frequency}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No configurations yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first test configuration to start monitoring your ecommerce website
          </p>
          <button
            onClick={handleCreateConfig}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Create Configuration</span>
          </button>
        </div>
      )}

      {/* Configuration Modal */}
      <ConfigurationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingConfig(null);
        }}
        configuration={editingConfig}
        onSave={async (config) => {
          if (editingConfig) {
            await actions.updateConfiguration(editingConfig._id, config);
          } else {
            await actions.createConfiguration(config);
          }
          setIsModalOpen(false);
          setEditingConfig(null);
        }}
      />
    </div>
  );
};

export default Configurations;