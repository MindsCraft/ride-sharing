import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import type { TabId } from './components/BottomTabBar';
import BottomTabBar from './components/BottomTabBar';

// Auth screens
import SplashScreen from './pages/auth/SplashScreen';
import LoginScreen from './pages/auth/LoginScreen';
import OTPScreen from './pages/auth/OTPScreen';
import OnboardingScreen from './pages/auth/OnboardingScreen';

// Main app pages
import HomePage from './pages/HomePage';
import OfferRidePage from './pages/OfferRidePage';
import ActivityPage from './pages/ActivityPage';
import ProfilePage from './pages/ProfilePage';

// Trip flow pages
import LiveTripPage from './pages/LiveTripPage';
import RateTripScreen from './pages/RateTripScreen';
import LandingPage from './pages/LandingPage';

// Inner component that reads context
const AppShell = () => {
  const { screen, myRequests, postedRides } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // Count pending negotiations for bottom bar badge
  const pendingCount = myRequests.filter(r => r.status === 'pending').length +
                    postedRides.reduce((s, r) => s + r.requests.filter(req => req.status === 'pending').length, 0);

  // Auth / trip flow screens (full screen, no tab bar)
  if (screen === 'splash') return <SplashScreen />;
  if (screen === 'landing') return <LandingPage />;
  if (screen === 'login') return <LoginScreen />;
  if (screen === 'otp') return <OTPScreen />;
  if (screen === 'onboarding') return <OnboardingScreen />;
  if (screen === 'live_trip') return <LiveTripPage />;
  if (screen === 'rate_trip') return <RateTripScreen />;

  // Main app with bottom tabs
  return (
    <div className="app-container">
      <div className="page-content">
        {/* Keep all pages mounted — avoids map re-init on tab switch */}
        <div style={{ display: activeTab === 'home' ? 'block' : 'none', height: '100%' }}>
          <HomePage />
        </div>
        <div style={{ display: activeTab === 'offer' ? 'flex' : 'none', height: '100%', flexDirection: 'column' }}>
          <OfferRidePage />
        </div>
        <div style={{ display: activeTab === 'activity' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
          <ActivityPage />
        </div>
        <div style={{ display: activeTab === 'profile' ? 'block' : 'none', height: '100%', overflowY: 'auto' }}>
          <ProfilePage />
        </div>
      </div>

      <BottomTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activityCount={pendingCount}
      />
    </div>
  );
};

// Root wrapped with context provider
function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
