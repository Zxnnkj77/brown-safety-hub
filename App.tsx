
import React, { useState } from 'react';
import Layout from './components/Layout';
import Hub from './components/Hub';
import LiveMap from './components/LiveMap';
import History from './components/History';
import ReportForm from './components/ReportForm';
import { TabType } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('hub');
  // Initialize with an empty array as requested - reports will only appear after submission
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  const addReportToHistory = (report: any) => {
    const newItem = {
      id: `u-${Date.now()}`,
      title: report.type,
      subtitle: report.description,
      status: 'Investigated',
      date: 'Just now',
      icon: 'report',
      color: 'bg-orange-500',
      border: 'border-orange-100',
      statusBg: 'bg-orange-50',
      statusText: 'text-orange-600'
    };
    setHistoryItems(prev => [newItem, ...prev]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'hub':
        return <Hub onReportClick={() => setActiveTab('report')} />;
      case 'map':
        return <LiveMap />;
      case 'history':
        return <History reports={historyItems} />;
      case 'report':
        return (
          <ReportForm 
            onBack={() => setActiveTab('hub')} 
            onSuccess={(reportData) => {
              addReportToHistory(reportData);
              setActiveTab('history');
            }}
          />
        );
      default:
        return <Hub onReportClick={() => setActiveTab('report')} />;
    }
  };

  const showNav = activeTab !== 'report';

  return (
    <div className="antialiased text-[#0f172a] selection:bg-[#be0909] selection:text-white">
      {showNav ? (
        <Layout activeTab={activeTab} onTabChange={setActiveTab}>
          {renderContent()}
        </Layout>
      ) : (
        <div className="w-full h-screen max-w-md mx-auto bg-white flex flex-col relative shadow-2xl overflow-hidden border-x border-gray-100">
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default App;
