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
          Open Tickets Breakdown by Team
        </h3>
        <div className="text-sm text-gray-600 mb-4">
          Non-resolved tickets (open/pending) segregated by team assignment
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {data.l1_pending || 0}
            </div>
            <div className="text-lg font-semibold text-green-800 mb-1">L1 Team</div>
            <div className="text-sm text-green-600">Open tickets</div>
            <div className="mt-2 w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((data.l1_pending || 0) / Math.max(data.tickets_open || 1, 1) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <div className="text-xs text-green-600 mt-1">
              {data.tickets_open > 0 ? 
                Math.round((data.l1_pending || 0) / data.tickets_open * 100) : 0}% of total open
            </div>
          </div>
          
          <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {data.l2_pending || 0}
            </div>
            <div className="text-lg font-semibold text-blue-800 mb-1">L2 Team</div>
            <div className="text-sm text-blue-600">Open tickets</div>
            <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((data.l2_pending || 0) / Math.max(data.tickets_open || 1, 1) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {data.tickets_open > 0 ? 
                Math.round((data.l2_pending || 0) / data.tickets_open * 100) : 0}% of total open
            </div>
          </div>
          
          <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {data.business_pending || 0}
            </div>
            <div className="text-lg font-semibold text-purple-800 mb-1">Business Team</div>
            <div className="text-sm text-purple-600">Open tickets</div>
            <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((data.business_pending || 0) / Math.max(data.tickets_open || 1, 1) * 100, 100)}%` 
                }}
              ></div>
            </div>
            <div className="text-xs text-purple-600 mt-1">
              {data.tickets_open > 0 ? 
                Math.round((data.business_pending || 0) / data.tickets_open * 100) : 0}% of total open
            </div>
          </div>
        </div>
        
        {/* Summary Row */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700">Total Open Tickets:</span>
            <span className="font-bold text-gray-800 text-lg">
              {(data.l1_pending || 0) + (data.l2_pending || 0) + (data.business_pending || 0)}
            </span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Distribution: L1 ({data.l1_pending || 0}), L2 ({data.l2_pending || 0}), Business ({data.business_pending || 0})
          </div>
        </div>
      </div>

      {/* Top Performers */}
      {data.top_performers && data.top_performers.length > 0 && (
        <div className="performance-card" data-testid="top-performers-card">
          {/* Header - Responsive */}
          <div className="mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="text-xl md:text-2xl">🏆</span>
              <span className="hidden sm:inline">Top Performers (Balanced Score: Volume + SLA Performance)</span>
              <span className="sm:hidden">Top Performers</span>
            </h3>
            <div className="text-xs md:text-sm text-gray-600">
              <span className="hidden sm:inline">Ranked by performance score: SLA compliance + ticket volume (minimum 5 tickets)</span>
              <span className="sm:hidden">Volume + SLA performance (min. 5 tickets)</span>
            </div>
          </div>

          {/* Performers List - Mobile Responsive */}
          <div className="space-y-3 md:space-y-4">
            {data.top_performers.map((performer, index) => (
              <div key={performer.agent_name} className="bg-gray-50 rounded-lg p-3 md:p-4 hover:bg-gray-100 transition-colors">
                
                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-between">
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

                {/* Mobile Layout */}
                <div className="md:hidden">
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 
                        index === 2 ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {performer.agent_name}
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">{performer.total_tickets}</span> tickets
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {performer.performance_score || 0}
                      </div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  </div>
                  
                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white rounded-lg p-2">
                      <div className="text-sm font-bold text-blue-600">
                        {performer.response_sla_percentage || 0}%
                      </div>
                      <div className="text-xs text-gray-500">Response</div>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <div className="text-sm font-bold text-green-600">
                        {performer.resolution_sla_percentage || 0}%
                      </div>
                      <div className="text-xs text-gray-500">Resolution</div>
                    </div>
                    <div className="bg-white rounded-lg p-2">
                      <div className="text-sm font-bold text-purple-600">
                        {performer.overall_sla_percentage || performer.sla_percentage || 0}%
                      </div>
                      <div className="text-xs text-gray-500">Overall</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Performance Score Explanation - Collapsible on Mobile */}
          <div className="mt-4 md:mt-6">
            <details className="md:open">
              <summary className="md:hidden cursor-pointer p-3 bg-blue-50 rounded-lg border border-blue-200 font-semibold text-blue-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>📊</span>
                  How Scoring Works
                </span>
                <span className="text-blue-600">▼</span>
              </summary>
              
              <div className="mt-3 md:mt-0 p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="hidden md:flex font-semibold text-blue-900 mb-2 items-center gap-2">
                  <span>📊</span>
                  How Performance Score is Calculated
                </h4>
                <div className="text-xs md:text-sm text-blue-800 space-y-1">
                  <div>• <strong>SLA Score:</strong> Resolution SLA (60%) + Response SLA (40%)</div>
                  <div>• <strong>Volume Bonus:</strong> +1 point per ticket above 5 <span className="hidden sm:inline">(max +20 points)</span></div>
                  <div>• <strong>Minimum:</strong> Must have resolved at least 5 tickets</div>
                  <div className="hidden sm:block">• <strong>Result:</strong> Balanced ranking of productivity and quality</div>
                </div>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
