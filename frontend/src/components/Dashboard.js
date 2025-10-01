import React from 'react';

const Dashboard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-4 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Welcome to SLA Tracker</h2>
        <p className="text-gray-600 mb-8">Upload your Excel data to start tracking individual SLA performance</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="font-semibold text-blue-900 mb-2">Get Started:</h3>
          <ol className="text-left text-blue-800 space-y-2">
            <li>1. Click "Upload Data" to import your Excel file</li>
            <li>2. View overall dashboard metrics and KPIs</li>
            <li>3. Analyze individual agent performance</li>
            <li>4. Track team-level SLA compliance</li>
          </ol>
        </div>
      </div>
    );
  }

  const getSLAStatusColor = (percentage) => {
    if (percentage >= 95) return 'excellent';
    if (percentage >= 85) return 'good';
    if (percentage >= 70) return 'average';
    return 'poor';
  };

  const formatPercentage = (value) => {
    return `${value || 0}%`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
          Help Center SLA Dashboard
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Real-time individual and team performance tracking
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="stats-grid">
        <div className="metric-card p-6" data-testid="total-tickets-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Tickets</h3>
            <div className="text-3xl">🎫</div>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {data.total_tickets?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            All time tickets processed
          </div>
        </div>

        <div className="metric-card p-6" data-testid="tickets-closed-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Tickets Closed</h3>
            <div className="text-3xl">✅</div>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {data.tickets_closed_today?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Successfully resolved
          </div>
        </div>

        <div className="metric-card p-6" data-testid="tickets-open-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Open Tickets</h3>
            <div className="text-3xl">⏳</div>
          </div>
          <div className="text-3xl font-bold text-orange-600">
            {data.tickets_open?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Currently in progress
          </div>
        </div>

        <div className="metric-card p-6" data-testid="sla-breaches-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">SLA Breaches</h3>
            <div className="text-3xl">⚠️</div>
          </div>
          <div className="text-3xl font-bold text-red-600">
            {data.sla_breaches_today?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Requires attention
          </div>
        </div>
      </div>

      {/* SLA Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="performance-card" data-testid="response-sla-card">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Response SLA Performance
          </h3>
          <div className="text-4xl font-bold text-blue-600 mb-4">
            {formatPercentage(data.overall_response_sla)}
          </div>
          <div className="progress-bar mb-4">
            <div 
              className={`progress-fill ${getSLAStatusColor(data.overall_response_sla || 0)}`}
              style={{ width: `${data.overall_response_sla || 0}%` }}
            ></div>
          </div>
          <div className={`sla-indicator ${
            (data.overall_response_sla || 0) >= 95 ? 'met' : 
            (data.overall_response_sla || 0) >= 70 ? 'at-risk' : 'breached'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            {(data.overall_response_sla || 0) >= 95 ? 'Excellent' : 
             (data.overall_response_sla || 0) >= 70 ? 'Needs Improvement' : 'Critical'}
          </div>
        </div>

        <div className="performance-card" data-testid="resolution-sla-card">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Resolution SLA Performance
          </h3>
          <div className="text-4xl font-bold text-green-600 mb-4">
            {formatPercentage(data.overall_resolution_sla)}
          </div>
          <div className="progress-bar mb-4">
            <div 
              className={`progress-fill ${getSLAStatusColor(data.overall_resolution_sla || 0)}`}
              style={{ width: `${data.overall_resolution_sla || 0}%` }}
            ></div>
          </div>
          <div className={`sla-indicator ${
            (data.overall_resolution_sla || 0) >= 95 ? 'met' : 
            (data.overall_resolution_sla || 0) >= 70 ? 'at-risk' : 'breached'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current"></span>
            {(data.overall_resolution_sla || 0) >= 95 ? 'Excellent' : 
             (data.overall_resolution_sla || 0) >= 70 ? 'Needs Improvement' : 'Critical'}
          </div>
        </div>
      </div>

      {/* Pending Tickets Breakdown */}
      <div className="performance-card" data-testid="pending-breakdown-card">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Pending Tickets Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {data.business_pending || 0}
            </div>
            <div className="text-sm font-medium text-blue-800">Business Team</div>
            <div className="text-xs text-blue-600 mt-1">Pending tickets</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {data.functional_pending || 0}
            </div>
            <div className="text-sm font-medium text-purple-800">Functional Team</div>
            <div className="text-xs text-purple-600 mt-1">Pending tickets</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {data.dealer_pending || 0}
            </div>
            <div className="text-sm font-medium text-orange-800">Dealer/Data Team</div>
            <div className="text-xs text-orange-600 mt-1">Pending tickets</div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      {data.top_performers && data.top_performers.length > 0 && (
        <div className="performance-card" data-testid="top-performers-card">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            Top Performers (Balanced Score: Volume + SLA Performance)
          </h3>
          <div className="text-sm text-gray-600 mb-4">
            Ranked by performance score: SLA compliance + ticket volume (minimum 5 tickets)
          </div>
          <div className="space-y-4">
            {data.top_performers.map((performer, index) => (
              <div key={performer.agent_name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 
                    index === 2 ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">
                      {performer.agent_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{performer.total_tickets}</span> tickets resolved
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                      <span>Response: <span className="font-medium">{performer.response_sla_percentage || 0}%</span></span>
                      <span>Resolution: <span className="font-medium">{performer.resolution_sla_percentage || 0}%</span></span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {performer.overall_sla_percentage || performer.sla_percentage || 0}%
                      </div>
                      <div className="text-xs text-gray-500">Overall SLA</div>
                    </div>
                    <div className="border-l pl-3">
                      <div className="text-lg font-bold text-blue-600">
                        {performer.performance_score || 0}
                      </div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Performance Score Explanation */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <span>📊</span>
              How Performance Score is Calculated
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>• <strong>SLA Score:</strong> Resolution SLA (60%) + Response SLA (40%)</div>
              <div>• <strong>Volume Bonus:</strong> +1 point per ticket above 5 (max +20 points)</div>
              <div>• <strong>Minimum Requirement:</strong> Must have resolved at least 5 tickets</div>
              <div>• <strong>Result:</strong> Balanced ranking of productivity and quality</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
