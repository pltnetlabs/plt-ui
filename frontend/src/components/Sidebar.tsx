import type { TabKey } from '../App';

type SidebarProps = {
  tabs: { key: TabKey; label: string }[];
  activeTab: TabKey;
  onSelect: (key: TabKey) => void;
};

const Sidebar = ({ tabs, activeTab, onSelect }: SidebarProps) => {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <span className="sidebar__title">PLT Node UI</span>
        <span className="sidebar__subtitle">Local Tendermint RPC</span>
      </div>
      <nav className="sidebar__nav">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => onSelect(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
