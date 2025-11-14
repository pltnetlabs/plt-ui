import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import Transactions from './pages/Transactions';
import Send from './pages/Send';
import Receive from './pages/Receive';
import NodeDebug from './pages/NodeDebug';
import Settings from './pages/Settings';
import { SetRPCBaseURL } from '../wailsjs/go/main/App';
import './App.css';

export type TabKey = 'overview' | 'transactions' | 'send' | 'receive' | 'debug' | 'settings';

const tabItems: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'send', label: 'Send' },
  { key: 'receive', label: 'Receive' },
  { key: 'debug', label: 'Node / Debug' },
  { key: 'settings', label: 'Settings' },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  useEffect(() => {
    const overrideURL = (import.meta.env.VITE_PLT_RPC_URL as string | undefined)?.trim();
    if (overrideURL) {
      SetRPCBaseURL(overrideURL).catch((error) => {
        console.error('Failed to set RPC base URL', error);
      });
    }
  }, []);

  const ActiveView = useMemo(() => {
    switch (activeTab) {
      case 'transactions':
        return <Transactions />;
      case 'send':
        return <Send />;
      case 'receive':
        return <Receive />;
      case 'debug':
        return <NodeDebug />;
      case 'settings':
        return <Settings />;
      case 'overview':
      default:
        return <Overview />;
    }
  }, [activeTab]);

  return (
    <div className="app-shell">
      <Sidebar tabs={tabItems} activeTab={activeTab} onSelect={setActiveTab} />
      <main className="content-area">{ActiveView}</main>
    </div>
  );
}

export default App;
