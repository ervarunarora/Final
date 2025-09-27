import React from 'react';

const Navigation = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'upload', label: 'Upload Data', icon: '📤' },
    { id: 'agents', label: 'Agent Performance', icon: '👤' },
    { id: 'teams', label: 'Team Performance', icon: '👥' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-gradient">
              📈 SLA Tracker
            </div>
            <div className="text-sm text-gray-500 ml-4">
              Help Center Individual Performance Dashboard
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`nav-item ${
                  currentView === item.id ? 'active' : ''
                }`}
                data-testid={`nav-${item.id}`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
