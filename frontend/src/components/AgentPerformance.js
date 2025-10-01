import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AgentPerformance = () => {
  const [agents, setAgents] = useState([]);
  const [agentPerformance, setAgentPerformance] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('total_tickets');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterByTeam, setFilterByTeam] = useState('all');
  const [view, setView] = useState('cards'); // 'cards' or 'table'

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/agents');
      setAgents(response.data);
      
      // Fetch performance data for each agent
      const performancePromises = response.data.map(agent => 
        fetchAgentPerformance(agent.name)
      );
      
      const performanceResults = await Promise.all(performancePromises);
      const performanceMap = {};
      response.data.forEach((agent, index) => {
        performanceMap[agent.name] = performanceResults[index];
      });
      
      setAgentPerformance(performanceMap);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentPerformance = async (agentName) => {
    try {
      const response = await axios.get(`/agent-performance/${encodeURIComponent(agentName)}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching performance for ${agentName}:`, error);
      return {
        agent_name: agentName,
        total_tickets: 0,
        response_sla_percentage: 0,
        resolution_sla_percentage: 0,
        avg_response_time: 0,
        avg_resolution_time: 0
      };
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

  // Get unique teams for filter dropdown
  const uniqueTeams = [...new Set(agents.map(agent => agent.team).filter(Boolean))];

  // Sorting and filtering logic
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Enhanced filtering and sorting
  const filteredAndSortedAgents = agents
    .filter(agent => {
      const matchesSearch = 
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (agent.team && agent.team.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTeam = filterByTeam === 'all' || agent.team === filterByTeam;
      
      return matchesSearch && matchesTeam;
    })
    .sort((a, b) => {
      const aPerformance = agentPerformance[a.name] || {};
      const bPerformance = agentPerformance[b.name] || {};
      
      let aValue, bValue;
      
      switch (sortBy) {
        case 'total_tickets':
          aValue = aPerformance.total_tickets || 0;
          bValue = bPerformance.total_tickets || 0;
          break;
        case 'response_sla':
          aValue = aPerformance.response_sla_percentage || 0;
          bValue = bPerformance.response_sla_percentage || 0;
          break;
        case 'resolution_sla':
          aValue = aPerformance.resolution_sla_percentage || 0;
          bValue = bPerformance.resolution_sla_percentage || 0;
          break;
        case 'team':
          aValue = a.team || '';
          bValue = b.team || '';
          break;
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'avg_response_time':
          aValue = aPerformance.avg_response_time || 0;
          bValue = bPerformance.avg_response_time || 0;
          break;
        case 'avg_resolution_time':
          aValue = aPerformance.avg_resolution_time || 0;
          bValue = bPerformance.avg_resolution_time || 0;
          break;
        default:
          aValue = aPerformance.total_tickets || 0;
          bValue = bPerformance.total_tickets || 0;
      }
      
      if (typeof aValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-4 text-gray-600">Loading agent performance data...</span>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">No Agents Found</h2>
        <p className="text-gray-600">Upload your Excel data first to see individual agent performance</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Individual Agent Performance
        </h1>
        <p className="text-gray-600">
          Detailed SLA tracking and performance metrics by agent
        </p>
      </div>

      {/* Search, Filters, and Controls */}
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search agents by name or team..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              data-testid="agent-search"
            />
            <div className="absolute left-4 top-3.5 text-gray-400 text-xl">
              🔍
            </div>
          </div>
        </div>

        {/* Filters and Sort Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-center">
          {/* Team Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Team:</span>
            <select
              value={filterByTeam}
              onChange={(e) => setFilterByTeam(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid="team-filter"
            >
              <option value="all">All Teams</option>
              {uniqueTeams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-testid="sort-select"
            >
              <option value="total_tickets">Tickets Solved</option>
              <option value="response_sla">Response SLA %</option>
              <option value="resolution_sla">Resolution SLA %</option>
              <option value="team">Team</option>
              <option value="name">Agent Name</option>
              <option value="avg_response_time">Avg Response Time</option>
              <option value="avg_resolution_time">Avg Resolution Time</option>
            </select>
          </div>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
            data-testid="sort-order"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('cards')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === 'cards' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              data-testid="view-cards"
            >
              📊 Cards
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                view === 'table' 
                  ? 'bg-white text-blue-600 shadow' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              data-testid="view-table"
            >
              📋 Table
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-center text-sm text-gray-600">
          Showing {filteredAndSortedAgents.length} of {agents.length} agents
          {filterByTeam !== 'all' && ` in ${filterByTeam}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      </div>

      {/* Agent Performance Display */}
      {view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedAgents.map((agent) => {
          const performance = agentPerformance[agent.name] || {};
          const responseSLA = performance.response_sla_percentage || 0;
          const resolutionSLA = performance.resolution_sla_percentage || 0;
          
          return (
            <div 
              key={agent.id} 
              className="performance-card cursor-pointer"
              onClick={() => setSelectedAgent(agent)}
              data-testid={`agent-card-${agent.name}`}
            >
              {/* Agent Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {agent.name}
                  </h3>
                  <div className="text-sm text-gray-600">
                    {agent.team}
                  </div>
                </div>
                <div className="text-3xl">👤</div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Tickets</span>
                  <span className="text-lg font-bold text-blue-600">
                    {performance.total_tickets || 0}
                  </span>
                </div>

                {/* Response SLA */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Response SLA</span>
                    <span className="text-sm font-semibold">
                      {responseSLA.toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${getSLAStatusColor(responseSLA)}`}
                      style={{ width: `${Math.min(responseSLA, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getSLAStatusLabel(responseSLA)}
                  </div>
                </div>

                {/* Resolution SLA */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Resolution SLA</span>
                    <span className="text-sm font-semibold">
                      {resolutionSLA.toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${getSLAStatusColor(resolutionSLA)}`}
                      style={{ width: `${Math.min(resolutionSLA, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getSLAStatusLabel(resolutionSLA)}
                  </div>
                </div>

                {/* Average Times */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Avg Response: {performance.avg_response_time?.toFixed(1) || 0}h</span>
                    <span>Avg Resolution: {performance.avg_resolution_time?.toFixed(1) || 0}h</span>
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="performance-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th 
                  className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('name')}
                  data-testid="sort-name"
                >
                  Agent Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-left py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('team')}
                  data-testid="sort-team"
                >
                  Team {sortBy === 'team' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-center py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('total_tickets')}
                  data-testid="sort-tickets"
                >
                  Tickets Solved {sortBy === 'total_tickets' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-center py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('response_sla')}
                  data-testid="sort-response"
                >
                  Response SLA {sortBy === 'response_sla' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-center py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('resolution_sla')}
                  data-testid="sort-resolution"
                >
                  Resolution SLA {sortBy === 'resolution_sla' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-center py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('avg_response_time')}
                >
                  Avg Response {sortBy === 'avg_response_time' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="text-center py-3 px-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('avg_resolution_time')}
                >
                  Avg Resolution {sortBy === 'avg_resolution_time' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedAgents.map((agent, index) => {
                const performance = agentPerformance[agent.name] || {};
                const responseSLA = performance.response_sla_percentage || 0;
                const resolutionSLA = performance.resolution_sla_percentage || 0;
                
                return (
                  <tr 
                    key={agent.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{agent.name}</div>
                          <div className="text-xs text-gray-500">{agent.employee_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ 
                        agent.team === 'Technical Team' ? 'bg-blue-100 text-blue-800' :
                        agent.team === 'Business Team' ? 'bg-green-100 text-green-800' :
                        agent.team === 'Functional Team' ? 'bg-purple-100 text-purple-800' :
                        agent.team === 'Data Team' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {agent.team || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-blue-600">
                        {performance.total_tickets || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-semibold ${
                          responseSLA >= 95 ? 'text-green-600' :
                          responseSLA >= 85 ? 'text-blue-600' :
                          responseSLA >= 70 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {responseSLA.toFixed(1)}%
                        </span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getSLAStatusColor(responseSLA)}`}
                            style={{ width: `${Math.min(responseSLA, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`font-semibold ${
                          resolutionSLA >= 95 ? 'text-green-600' :
                          resolutionSLA >= 85 ? 'text-blue-600' :
                          resolutionSLA >= 70 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {resolutionSLA.toFixed(1)}%
                        </span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getSLAStatusColor(resolutionSLA)}`}
                            style={{ width: `${Math.min(resolutionSLA, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">
                      {(performance.avg_response_time || 0).toFixed(1)}h
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">
                      {(performance.avg_resolution_time || 0).toFixed(1)}h
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedAgent(agent)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        data-testid={`view-agent-${agent.name}`}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAndSortedAgents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🔍</div>
              <div className="text-lg font-medium">No agents found</div>
              <div className="text-sm">Try adjusting your search or filters</div>
            </div>
          )}
        </div>
      )}

      {/* Detailed Agent Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedAgent.name}
                  </h2>
                  <div className="text-gray-600">
                    {selectedAgent.team} • ID: {selectedAgent.employee_id}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                  data-testid="close-modal"
                >
                  ✕
                </button>
              </div>

              {/* Detailed Performance */}
              <div className="space-y-6">
                {(() => {
                  const performance = agentPerformance[selectedAgent.name] || {};
                  return (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-blue-600">
                            {performance.total_tickets || 0}
                          </div>
                          <div className="text-sm text-blue-800">Total Tickets</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="text-2xl font-bold text-green-600">
                            {performance.resolution_sla_met || 0}
                          </div>
                          <div className="text-sm text-green-800">SLA Met</div>
                        </div>
                      </div>

                      {/* SLA Breakdown */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">SLA Performance</h3>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Response SLA</span>
                            <span className="font-bold">
                              {(performance.response_sla_percentage || 0).toFixed(1)}%
                            </span>
                          </div>
                          <div className="progress-bar mb-2">
                            <div 
                              className={`progress-fill ${getSLAStatusColor(performance.response_sla_percentage || 0)}`}
                              style={{ width: `${Math.min(performance.response_sla_percentage || 0, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Met: {performance.response_sla_met || 0}</span>
                            <span>Breached: {performance.response_sla_breached || 0}</span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Resolution SLA</span>
                            <span className="font-bold">
                              {(performance.resolution_sla_percentage || 0).toFixed(1)}%
                            </span>
                          </div>
                          <div className="progress-bar mb-2">
                            <div 
                              className={`progress-fill ${getSLAStatusColor(performance.resolution_sla_percentage || 0)}`}
                              style={{ width: `${Math.min(performance.resolution_sla_percentage || 0, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Met: {performance.resolution_sla_met || 0}</span>
                            <span>Breached: {performance.resolution_sla_breached || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Average Times */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium mb-3">Average Response Times</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-lg font-bold text-blue-600">
                              {(performance.avg_response_time || 0).toFixed(1)}h
                            </div>
                            <div className="text-sm text-gray-600">Response Time</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">
                              {(performance.avg_resolution_time || 0).toFixed(1)}h
                            </div>
                            <div className="text-sm text-gray-600">Resolution Time</div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {filteredAndSortedAgents.length > 0 && (
        <div className="performance-card">
          <h3 className="text-xl font-bold text-gray-800 mb-6">
            📊 Summary Statistics ({filteredAndSortedAgents.length} agents)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {filteredAndSortedAgents.reduce((sum, agent) => 
                  sum + (agentPerformance[agent.name]?.total_tickets || 0), 0
                ).toLocaleString()}
              </div>
              <div className="text-sm text-blue-800 font-medium">Total Tickets Solved</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {filteredAndSortedAgents.length > 0 ? (
                  (filteredAndSortedAgents.reduce((sum, agent) => 
                    sum + (agentPerformance[agent.name]?.response_sla_percentage || 0), 0
                  ) / filteredAndSortedAgents.length).toFixed(1)
                ) : 0}%
              </div>
              <div className="text-sm text-green-800 font-medium">Avg Response SLA</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {filteredAndSortedAgents.length > 0 ? (
                  (filteredAndSortedAgents.reduce((sum, agent) => 
                    sum + (agentPerformance[agent.name]?.resolution_sla_percentage || 0), 0
                  ) / filteredAndSortedAgents.length).toFixed(1)
                ) : 0}%
              </div>
              <div className="text-sm text-purple-800 font-medium">Avg Resolution SLA</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {filteredAndSortedAgents.filter(agent => 
                  (agentPerformance[agent.name]?.resolution_sla_percentage || 0) >= 95
                ).length}
              </div>
              <div className="text-sm text-orange-800 font-medium">Top Performers (95%+)</div>
            </div>
          </div>
          
          {/* Additional Team Breakdown */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Performance by Team</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {uniqueTeams.map(team => {
                const teamAgents = filteredAndSortedAgents.filter(agent => agent.team === team);
                const teamAvgResponse = teamAgents.length > 0 ? 
                  (teamAgents.reduce((sum, agent) => 
                    sum + (agentPerformance[agent.name]?.response_sla_percentage || 0), 0
                  ) / teamAgents.length) : 0;
                const teamAvgResolution = teamAgents.length > 0 ?
                  (teamAgents.reduce((sum, agent) => 
                    sum + (agentPerformance[agent.name]?.resolution_sla_percentage || 0), 0
                  ) / teamAgents.length) : 0;

                return (
                  <div key={team} className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-800 mb-2">{team}</h5>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Agents:</span>
                        <span className="font-medium">{teamAgents.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response SLA:</span>
                        <span className="font-medium">{teamAvgResponse.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Resolution SLA:</span>
                        <span className="font-medium">{teamAvgResolution.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentPerformance;
