import React, { useEffect, useState } from 'react';
import { useTest } from '../contexts/TestContext';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Activity,
  Globe,
  Zap
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state, actions } = useTest();
  const [trends, setTrends] = useState([]);

  useEffect(() => {
    actions.loadDashboardData();
  }, []);

  const stats = [
    {
      name: 'Total Tests',
      value: state.dashboardData?.totalTests || 0,
      change: '+12%',
      changeType: 'positive',
      icon: Activity
    },
    {
      name: 'Success Rate',
      value: `${state.dashboardData?.successRate || 0}%`,
      change: '+2.1%',
      changeType: 'positive',
      icon: CheckCircle
    },
    {
      name: 'Active Configurations',
      value: state.dashboardData?.totalConfigurations || 0,
      change: '+1',
      changeType: 'positive',
      icon: Globe
    },
    {
      name: 'Tests This Month',
      value: state.dashboardData?.testsLast30Days || 0,
      change: '+18%',
      changeType: 'positive',
      icon: TrendingUp
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">AI-Powered Testing Dashboard</h2>
            <p className="text-blue-100">
              Monitor your ecommerce website performance and reliability in real-time
            </p>
          </div>
          <div className="hidden md:block">
            <Zap className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Tests and Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Test Results</h3>
          </div>
          <div className="p-6">
            {state.dashboardData?.recentTests?.length > 0 ? (
              <div className="space-y-4">
                {state.dashboardData.recentTests.slice(0, 5).map((test: any) => (
                  <div key={test._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`h-3 w-3 rounded-full ${
                        test.status === 'completed' ? 'bg-green-500' : 
                        test.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{test.configurationId?.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(test.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        test.aiAnalysis?.riskLevel ? getRiskColor(test.aiAnalysis.riskLevel) : 'bg-gray-100 text-gray-800'
                      }`}>
                        {test.aiAnalysis?.riskLevel || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent tests available</p>
              </div>
            )}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Risk Distribution</h3>
          </div>
          <div className="p-6">
            {state.dashboardData?.riskDistribution?.length > 0 ? (
              <div className="space-y-4">
                {state.dashboardData.riskDistribution.map((risk: any) => (
                  <div key={risk._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded ${
                        risk._id === 'low' ? 'bg-green-500' :
                        risk._id === 'medium' ? 'bg-yellow-500' :
                        risk._id === 'high' ? 'bg-orange-500' : 'bg-red-500'
                      }`}></div>
                      <span className="capitalize text-gray-700">{risk._id} Risk</span>
                    </div>
                    <span className="font-semibold text-gray-900">{risk.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No risk data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;