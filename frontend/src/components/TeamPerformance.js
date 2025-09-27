import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeamPerformance = () => {
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [sortBy, setSortBy] = useState('resolution_sla_percentage');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchTeamPerformance();
  }, []);

  const fetchTeamPerformance = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/team-performance');
      setTeamData(response.data);
    } catch (error) {
      console.error('Error fetching team performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSLAStatusColor = (percentage) => {
    if (percentage >= 95) return 'excellent';
    if (percentage >= 85) return 'good';
    if (percentage >= 70) return 'average';
    return 'poor';
  };

  const getSLAStatusLabel = (percentage) => {
    if (percentage >= 95) return 'Excellent';
    if (percentage >= 85) return 'Good';
    if (percentage >= 70) return 'Needs Improvement';
    return 'Critical';
  };

  const getTeamIcon = (teamName) => {
    if (!teamName) return '👥';
    if (teamName.toLowerCase().includes('business')) return '💼';
    if (teamName.toLowerCase().includes('functional')) return '⚙️';
    if (teamName.toLowerCase().includes('technical')) return '🔧';
    if (teamName.toLowerCase().includes('data')) return '📊';
    return '👥';
  };

  const sortedTeamData = [...teamData].sort((a, b) => {
    const aValue = a[sortBy] || 0;
    const bValue = b[sortBy] || 0;
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-4 text-gray-600">Loading team performance data...</span>
      </div>
    );
  }

  if (teamData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👥</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">No Team Data Found</h2>
        <p className="text-gray-600">Upload your Excel data first to see team performance metrics</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Team Performance Analysis
        </h1>
        <p className="text-gray-600">
          Comprehensive SLA tracking and performance metrics by team
        </p>
      </div>

      {/* Overall Team Summary */}
      <div className="performance-card">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">📈</span>
          Overall Team Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {teamData.length}
            </div>
            <div className="text-sm text-blue-800">Active Teams</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {teamData.reduce((sum, team) => sum + (team.total_tickets || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-green-800">Total Tickets</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {teamData.length > 0 ? (
                (teamData.reduce((sum, team) => sum + (team.response_sla_percentage || 0), 0) / teamData.length).toFixed(1)
              ) : 0}%
            </div>
            <div className="text-sm text-purple-800">Avg Response SLA</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {teamData.length > 0 ? (
                (teamData.reduce((sum, team) => sum + (team.resolution_sla_percentage || 0), 0) / teamData.length).toFixed(1)
              ) : 0}%
            </div>
            <div className="text-sm text-orange-800">Avg Resolution SLA</div>
          </div>
        </div>
      </div>

      {/* Sorting Controls */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => handleSort('total_tickets')}
          className={`btn ${sortBy === 'total_tickets' ? 'btn-primary' : 'btn-secondary'}`}
          data-testid="sort-tickets"
        >
          Sort by Tickets {sortBy === 'total_tickets' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('response_sla_percentage')}
          className={`btn ${sortBy === 'response_sla_percentage' ? 'btn-primary' : 'btn-secondary'}`}
          data-testid="sort-response-sla"
        >
          Sort by Response SLA {sortBy === 'response_sla_percentage' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button
          onClick={() => handleSort('resolution_sla_percentage')}
          className={`btn ${sortBy === 'resolution_sla_percentage' ? 'btn-primary' : 'btn-secondary'}`}
          data-testid="sort-resolution-sla"
        >
          Sort by Resolution SLA {sortBy === 'resolution_sla_percentage' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* Team Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedTeamData.map((team, index) => {
          const responseSLA = team.response_sla_percentage || 0;
          const resolutionSLA = team.resolution_sla_percentage || 0;
          
          return (
            <div 
              key={team.team_name} 
              className="performance-card cursor-pointer"
              onClick={() => setSelectedTeam(team)}
              data-testid={`team-card-${team.team_name}`}
            >
              {/* Team Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{getTeamIcon(team.team_name)}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {team.team_name || 'All Teams'}
                    </h3>
                    <div className="text-sm text-gray-600">
                      Rank #{index + 1} • {team.total_tickets || 0} tickets
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {index === 0 ? '🥇 Top' : index === 1 ? '🥈 2nd' : index === 2 ? '🥉 3rd' : `#${index + 1}`}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                {/* Response SLA */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Response SLA</span>
                    <span className="text-lg font-bold text-blue-600">
                      {responseSLA.toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${getSLAStatusColor(responseSLA)}`}
                      style={{ width: `${Math.min(responseSLA, 100)}%` }}
                    ></div>
                  </div>
                  <div className={`sla-indicator mt-2 inline-flex ${
                    responseSLA >= 95 ? 'met' : 
                    responseSLA >= 70 ? 'at-risk' : 'breached'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current mr-1"></span>
                    {getSLAStatusLabel(responseSLA)}
                  </div>
                </div>

                {/* Resolution SLA */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Resolution SLA</span>
                    <span className="text-lg font-bold text-green-600">
                      {resolutionSLA.toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${getSLAStatusColor(resolutionSLA)}`}
                      style={{ width: `${Math.min(resolutionSLA, 100)}%` }}
                    ></div>
                  </div>
                  <div className={`sla-indicator mt-2 inline-flex ${
                    resolutionSLA >= 95 ? 'met' : 
                    resolutionSLA >= 70 ? 'at-risk' : 'breached'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-current mr-1"></span>
                    {getSLAStatusLabel(resolutionSLA)}
                  </div>
                </div>

                {/* Average Times */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-gray-800">
                        {(team.avg_response_time || 0).toFixed(1)}h
                      </div>
                      <div className="text-gray-600">Avg Response</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-gray-800">
                        {(team.avg_resolution_time || 0).toFixed(1)}h
                      </div>
                      <div className="text-gray-600">Avg Resolution</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Comparison Table */}
      <div className="performance-card">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          Team Comparison Table
        </h3>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th className="text-left">Team</th>
                <th className="text-center cursor-pointer" onClick={() => handleSort('total_tickets')}>
                  Total Tickets {sortBy === 'total_tickets' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-center cursor-pointer" onClick={() => handleSort('response_sla_percentage')}>
                  Response SLA {sortBy === 'response_sla_percentage' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-center cursor-pointer" onClick={() => handleSort('resolution_sla_percentage')}>
                  Resolution SLA {sortBy === 'resolution_sla_percentage' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-center">Avg Response Time</th>
                <th className="text-center">Avg Resolution Time</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeamData.map((team, index) => (
                <tr key={team.team_name} className="hover:bg-gray-50">
                  <td className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{getTeamIcon(team.team_name)}</span>
                      <div>
                        <div className="font-semibold">{team.team_name}</div>
                        <div className="text-xs text-gray-500">Rank #{index + 1}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center font-semibold text-blue-600">
                    {(team.total_tickets || 0).toLocaleString()}
                  </td>
                  <td className="text-center">
                    <div className={`sla-indicator ${
                      (team.response_sla_percentage || 0) >= 95 ? 'met' : 
                      (team.response_sla_percentage || 0) >= 70 ? 'at-risk' : 'breached'
                    }`}>
                      {(team.response_sla_percentage || 0).toFixed(1)}%
                    </div>
                  </td>
                  <td className="text-center">
                    <div className={`sla-indicator ${
                      (team.resolution_sla_percentage || 0) >= 95 ? 'met' : 
                      (team.resolution_sla_percentage || 0) >= 70 ? 'at-risk' : 'breached'
                    }`}>
                      {(team.resolution_sla_percentage || 0).toFixed(1)}%
                    </div>
                  </td>
                  <td className="text-center text-gray-700">
                    {(team.avg_response_time || 0).toFixed(1)}h
                  </td>
                  <td className="text-center text-gray-700">
                    {(team.avg_resolution_time || 0).toFixed(1)}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Detail Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{getTeamIcon(selectedTeam.team_name)}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedTeam.team_name}
                    </h2>
                    <div className="text-gray-600">
                      Detailed Performance Analysis
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                  data-testid="close-team-modal"
                >
                  ✕
                </button>
              </div>

              {/* Detailed Team Metrics */}
              <div className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(selectedTeam.total_tickets || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-800">Total Tickets</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(selectedTeam.response_sla_percentage || 0).toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-800">Response SLA</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(selectedTeam.resolution_sla_percentage || 0).toFixed(1)}%
                    </div>
                    <div className="text-sm text-purple-800">Resolution SLA</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {((selectedTeam.response_sla_percentage || 0) + (selectedTeam.resolution_sla_percentage || 0) / 2).toFixed(1)}%
                    </div>
                    <div className="text-sm text-orange-800">Overall Score</div>
                  </div>
                </div>

                {/* Performance Visualization */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">SLA Performance Breakdown</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium">Response SLA Performance</span>
                      <span className="text-lg font-bold">
                        {(selectedTeam.response_sla_percentage || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="progress-bar mb-2">
                      <div 
                        className={`progress-fill ${getSLAStatusColor(selectedTeam.response_sla_percentage || 0)}`}
                        style={{ width: `${Math.min(selectedTeam.response_sla_percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Average response time: {(selectedTeam.avg_response_time || 0).toFixed(1)} hours
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium">Resolution SLA Performance</span>
                      <span className="text-lg font-bold">
                        {(selectedTeam.resolution_sla_percentage || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="progress-bar mb-2">
                      <div 
                        className={`progress-fill ${getSLAStatusColor(selectedTeam.resolution_sla_percentage || 0)}`}
                        style={{ width: `${Math.min(selectedTeam.resolution_sla_percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Average resolution time: {(selectedTeam.avg_resolution_time || 0).toFixed(1)} hours
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Recommendations</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    {(selectedTeam.resolution_sla_percentage || 0) < 70 && (
                      <p>• Focus on improving resolution processes - SLA performance is below target</p>
                    )}
                    {(selectedTeam.avg_resolution_time || 0) > 24 && (
                      <p>• Consider reducing average resolution time to improve customer satisfaction</p>
                    )}
                    {(selectedTeam.response_sla_percentage || 0) >= 95 && (
                      <p>• Excellent response time performance - maintain current standards</p>
                    )}
                    {(selectedTeam.total_tickets || 0) > 50 && (
                      <p>• High ticket volume team - monitor for capacity and workload balance</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPerformance;
