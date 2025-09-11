import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  configuration?: any;
  onSave: (config: any) => Promise<void>;
}

const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
  isOpen,
  onClose,
  configuration,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: '',
    targetUrl: '',
    platform: 'shopify',
    productPages: [{ url: '', identifier: '' }],
    testSettings: {
      timeout: 30000,
      retryAttempts: 3,
      viewport: {
        width: 1920,
        height: 1080
      },
      mobileTest: false
    },
    testTypes: {
      productPageTest: true,
      imageValidation: true,
      errorDetection: true
    },
    schedule: {
      enabled: false,
      frequency: 'daily'
    }
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (configuration) {
      setFormData(configuration);
    } else {
      // Reset form for new configuration
      setFormData({
        name: '',
        targetUrl: '',
        platform: 'shopify',
        productPages: [{ url: '', identifier: '' }],
        testSettings: {
          timeout: 30000,
          retryAttempts: 3,
          viewport: {
            width: 1920,
            height: 1080
          },
          mobileTest: false
        },
        testTypes: {
          productPageTest: true,
          imageValidation: true,
          errorDetection: true
        },
        schedule: {
          enabled: false,
          frequency: 'daily'
        }
      });
    }
  }, [configuration, isOpen]);

  const handleInputChange = (path: string, value: any) => {
    const keys = path.split('.');
    setFormData(prev => {
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }
      
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const addProductPage = () => {
    setFormData(prev => ({
      ...prev,
      productPages: [...prev.productPages, { url: '', identifier: '' }]
    }));
  };

  const removeProductPage = (index: number) => {
    if (formData.productPages.length > 1) {
      setFormData(prev => ({
        ...prev,
        productPages: prev.productPages.filter((_, i) => i !== index)
      }));
    }
  };

  const updateProductPage = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      productPages: prev.productPages.map((page, i) => 
        i === index ? { ...page, [field]: value } : page
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving configuration:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {configuration ? 'Edit Configuration' : 'New Test Configuration'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Configuration Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="My Shopify Store Tests"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Website URL
              </label>
              <input
                type="url"
                value={formData.targetUrl}
                onChange={(e) => handleInputChange('targetUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://mystore.myshopify.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <select
                value={formData.platform}
                onChange={(e) => handleInputChange('platform', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="shopify">Shopify</option>
                <option value="bigcommerce">BigCommerce</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Product Pages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Product Pages</h3>
              <button
                type="button"
                onClick={addProductPage}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Page</span>
              </button>
            </div>

            {formData.productPages.map((page, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="url"
                    value={page.url}
                    onChange={(e) => updateProductPage(index, 'url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://mystore.com/products/example"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="text"
                    value={page.identifier}
                    onChange={(e) => updateProductPage(index, 'identifier', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ID"
                  />
                </div>
                {formData.productPages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProductPage(index)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Test Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Test Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={formData.testSettings.timeout / 1000}
                  onChange={(e) => handleInputChange('testSettings.timeout', parseInt(e.target.value) * 1000)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="10"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Retry Attempts
                </label>
                <input
                  type="number"
                  value={formData.testSettings.retryAttempts}
                  onChange={(e) => handleInputChange('testSettings.retryAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="5"
                />
              </div>
            </div>
          </div>

          {/* Test Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Test Types</h3>
            
            <div className="space-y-3">
              {Object.entries(formData.testTypes).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={key}
                    checked={value as boolean}
                    onChange={(e) => handleInputChange(`testTypes.${key}`, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={key} className="ml-2 text-sm text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigurationModal;