import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import AgentPerformance from './components/AgentPerformance';
import TeamPerformance from './components/TeamPerformance';
import Navigation from './components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Set up axios defaults
axios.defaults.baseURL = API;

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/dashboard-summary');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleFileUploaded = () => {
    // Refresh dashboard data after file upload
    fetchDashboardData();
    setCurrentView('dashboard');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard data={dashboardData} loading={loading} />;
      case 'upload':
        return <FileUpload onFileUploaded={handleFileUploaded} />;
      case 'agents':
        return <AgentPerformance />;
      case 'teams':
        return <TeamPerformance />;
      default:
        return <Dashboard data={dashboardData} loading={loading} />;
    }
  };

  return (
    <div className="App">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navigation currentView={currentView} setCurrentView={setCurrentView} />
        <main className="container mx-auto px-4 py-8">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

export default App;
