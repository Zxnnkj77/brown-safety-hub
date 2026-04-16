
import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AdminApp from './admin/AdminApp';
import Layout from "./components/Layout";
import Hub from "./screens/Hub";
import LiveMap from "./screens/LiveMap";
import History from "./screens/History";
import ReportForm from './components/ReportForm';
import { TabType } from './types';

const StudentApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('hub');
  // Key used to signal History to refetch after a new report submission
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const renderContent = () => {
    switch (activeTab) {
      case 'hub':
        return <Hub onReportClick={() => setActiveTab('report')} />;
      case 'map':
        return <LiveMap />;
      case 'history':
        return <History refreshKey={historyRefreshKey} />;
      case 'report':
        return (
          <ReportForm 
            onBack={() => setActiveTab('hub')} 
            onSuccess={() => {
              setHistoryRefreshKey(k => k + 1);
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

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="*" element={<StudentApp />} />
    </Routes>
  </BrowserRouter>
);

export default App;
