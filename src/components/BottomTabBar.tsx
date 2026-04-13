import { Navigation2, Car, Bell, CircleUserRound } from 'lucide-react';

export type TabId = 'home' | 'offer' | 'activity' | 'profile';

interface BottomTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  activityCount?: number;
}

const BottomTabBar = ({ activeTab, onTabChange, activityCount = 0 }: BottomTabBarProps) => {
  return (
    <nav className="bottom-nav-bar">
      <button
        className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
        aria-label="Find a Ride"
      >
        <div className="tab-icon-wrapper">
          <Navigation2 size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} color={activeTab === 'home' ? 'var(--primary)' : 'var(--text-muted)'} />
        </div>
        <span className="tab-label">Ride</span>
      </button>

      <button
        className={`nav-tab ${activeTab === 'offer' ? 'active' : ''}`}
        onClick={() => onTabChange('offer')}
        aria-label="Offer a Ride"
      >
        <div className="tab-icon-wrapper">
          <Car size={24} strokeWidth={activeTab === 'offer' ? 2.5 : 2} color={activeTab === 'offer' ? 'var(--primary)' : 'var(--text-muted)'} />
        </div>
        <span className="tab-label">Drive</span>
      </button>

      <button
        className={`nav-tab ${activeTab === 'activity' ? 'active' : ''}`}
        onClick={() => onTabChange('activity')}
        aria-label="Activity"
      >
        <div className="tab-icon-wrapper relative">
          <Bell size={24} strokeWidth={activeTab === 'activity' ? 2.5 : 2} color={activeTab === 'activity' ? 'var(--primary)' : 'var(--text-muted)'} />
          {activityCount > 0 && (
            <span className="modern-badge" />
          )}
        </div>
        <span className="tab-label">Activity</span>
      </button>

      <button
        className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onTabChange('profile')}
        aria-label="Profile"
      >
        <div className="tab-icon-wrapper">
          <CircleUserRound size={24} strokeWidth={activeTab === 'profile' ? 2.5 : 2} color={activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)'} />
        </div>
        <span className="tab-label">Profile</span>
      </button>
    </nav>
  );
};

export default BottomTabBar;
