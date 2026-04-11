import { MapPin, Plus, Bell, User } from 'lucide-react';

export type TabId = 'home' | 'offer' | 'activity' | 'profile';

interface BottomTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  activityCount?: number;
}

const BottomTabBar = ({ activeTab, onTabChange, activityCount = 0 }: BottomTabBarProps) => {
  return (
    <nav className="bottom-tab-bar">
      <button
        className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
        aria-label="Find a Ride"
        id="tab-home"
      >
        <span className="tab-icon">
          <MapPin size={20} color={activeTab === 'home' ? 'var(--primary)' : 'var(--text-muted)'} />
        </span>
        <span className="tab-label">Find Ride</span>
      </button>

      <button
        className={`tab-btn offer-btn ${activeTab === 'offer' ? 'active' : ''}`}
        onClick={() => onTabChange('offer')}
        aria-label="Offer a Ride"
        id="tab-offer"
      >
        <span className="tab-icon">
          <Plus size={22} color="white" strokeWidth={2.5} />
        </span>
        <span className="tab-label" style={{ color: activeTab === 'offer' ? 'var(--primary)' : 'var(--text-muted)' }}>
          Offer
        </span>
      </button>

      <button
        className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
        onClick={() => onTabChange('activity')}
        aria-label="Activity"
        id="tab-activity"
        style={{ position: 'relative' }}
      >
        <span className="tab-icon">
          <Bell size={20} color={activeTab === 'activity' ? 'var(--primary)' : 'var(--text-muted)'} />
        </span>
        <span className="tab-label">Activity</span>
        {activityCount > 0 && (
          <span className="tab-badge">{activityCount > 9 ? '9+' : activityCount}</span>
        )}
      </button>

      <button
        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onTabChange('profile')}
        aria-label="Profile"
        id="tab-profile"
      >
        <span className="tab-icon">
          <User size={20} color={activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)'} />
        </span>
        <span className="tab-label">Profile</span>
      </button>
    </nav>
  );
};

export default BottomTabBar;
