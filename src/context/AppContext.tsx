import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  color: string;
  plate: string;
}

export interface AppUser {
  id: string;
  name: string;
  phone: string;
  role: 'both' | 'rider' | 'driver';
  avatarInitial: string;
  rating: number;
  totalRides: number;
  totalEarnings: number;
  isNidVerified: boolean;
  isEmailVerified: boolean;
  workEmail: string;
  emergencyContact: string;
  emergencyName: string;
  vehicles: Vehicle[];
}

export type AppScreen =
  | 'splash'
  | 'landing'
  | 'login'
  | 'otp'
  | 'onboarding'
  | 'main'
  | 'live_trip'
  | 'rate_trip';

export interface ActiveTrip {
  driverId: string;
  driverName: string;
  driverPhone?: string;
  driverRating: number;
  car: string;
  from: string;
  to: string;
  agreedPrice: number;
  startedAt: Date;
  driverLat: number;
  driverLng: number;
}

export interface RideRequest {
  id: string;
  rideId: string;
  riderId: string;
  riderName: string;
  riderPhone?: string;
  riderRating: number;
  riderInitial: string;
  offeredPrice: number;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface PostedRide {
  id: string;
  from: string;
  to: string;
  time: string;
  seats: number;
  seatsLeft: number;
  price: string;
  isRecurring: boolean;
  status: 'active' | 'full' | 'cancelled';
  requests: RideRequest[];
}

export interface MyRideRequest extends RideRequest {
  driverName: string;
  driverPhone: string;
  from: string;
  to: string;
  departureTime: string;
}

// ─── Convert Supabase profile row → AppUser ────────────────────────────────────
function rowToAppUser(profile: Record<string, unknown>, vehicles: Vehicle[]): AppUser {
  const name = (profile.name as string) || '';
  return {
    id: profile.id as string,
    name,
    phone: (profile.phone as string) || '',
    role: ((profile.role as string) || 'both') as AppUser['role'],
    avatarInitial: name.charAt(0).toUpperCase() || 'U',
    rating: Number(profile.rating) || 5.0,
    totalRides: (profile.total_rides as number) || 0,
    totalEarnings: Number(profile.total_earnings) || 0,
    isNidVerified: (profile.is_nid_verified as boolean) || false,
    isEmailVerified: (profile.is_email_verified as boolean) || false,
    workEmail: (profile.work_email as string) || '',
    emergencyContact: (profile.emergency_contact as string) || '',
    emergencyName: (profile.emergency_name as string) || '',
    vehicles,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextType {
  screen: AppScreen;
  setScreen: (s: AppScreen) => void;
  user: AppUser | null;
  setUser: (u: AppUser | null) => void;
  pendingPhone: string;
  setPendingPhone: (p: string) => void;
  activeTrip: ActiveTrip | null;
  setActiveTrip: (t: ActiveTrip | null) => void;
  completedTrip: ActiveTrip | null;
  setCompletedTrip: (t: ActiveTrip | null) => void;
  postedRides: PostedRide[];
  setPostedRides: (r: PostedRide[]) => void;
  myRequests: MyRideRequest[];
  setMyRequests: (r: MyRideRequest[]) => void;

  refreshProfile: () => Promise<void>;
  refreshAppData: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [user, setUser] = useState<AppUser | null>(null);
  const [pendingPhone, setPendingPhone] = useState('');
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [completedTrip, setCompletedTrip] = useState<ActiveTrip | null>(null);
  const [postedRides, setPostedRides] = useState<PostedRide[]>([]);
  const [myRequests, setMyRequests] = useState<MyRideRequest[]>([]);
  const loadingUserId = useRef<string | null>(null); // Guard: track which userId is being loaded

  const fetchAppData = async (userId: string) => {
    // 1. Fetch rides posted by me (Driver Inbox)
    const { data: ridesData } = await supabase
      .from('rides')
      .select(`
        *,
        ride_requests (
          id,
          rider_id,
          offered_price,
          message,
          status,
          profiles: rider_id (name, rating, phone)
        )
      `)
      .eq('driver_id', userId)
      .order('created_at', { ascending: false });

    if (ridesData) {
      const formattedRides: PostedRide[] = ridesData.map((r: any) => ({
        id: r.id,
        from: r.from_address,
        to: r.to_address,
        time: new Date(r.departure_time).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' }),
        seats: r.total_seats,
        seatsLeft: r.seats_left,
        price: r.price_per_seat > 0 ? `৳${r.price_per_seat}` : 'Negotiable',
        isRecurring: r.is_recurring,
        status: r.status,
        requests: (r.ride_requests || []).map((req: any) => ({
          id: req.id,
          rideId: r.id,
          riderId: req.rider_id,
          riderName: req.profiles?.name || 'User',
          riderPhone: req.profiles?.phone || '',
          riderRating: req.profiles?.rating || 5.0,
          riderInitial: (req.profiles?.name || 'U').charAt(0).toUpperCase(),
          offeredPrice: req.offered_price,
          message: req.message || '',
          status: req.status,
        })),
      }));
      setPostedRides(formattedRides);
    }

    // 2. Fetch requests sent by me (My Rides)
    const { data: myReqsData } = await supabase
      .from('ride_requests')
      .select(`
        *,
        rides: ride_id (
          from_address,
          to_address,
          departure_time,
          profiles: driver_id (name, phone)
        )
      `)
      .eq('rider_id', userId)
      .order('created_at', { ascending: false });

    if (myReqsData) {
      const formattedMyReqs: MyRideRequest[] = myReqsData.map((req: any) => ({
        id: req.id,
        rideId: req.ride_id,
        riderId: userId,
        riderName: user?.name || '',
        riderRating: user?.rating || 5.0,
        riderInitial: (user?.name || 'U').charAt(0).toUpperCase(),
        offeredPrice: req.offered_price,
        message: req.message || '',
        status: req.status,
        driverName: req.rides?.profiles?.name || 'Driver',
        driverPhone: req.rides?.profiles?.phone || '',
        from: req.rides?.from_address || '',
        to: req.rides?.to_address || '',
        departureTime: req.rides?.departure_time ? new Date(req.rides.departure_time).toLocaleString('en-BD', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '',
      }));
      setMyRequests(formattedMyReqs);

      // ─── Auto-Resume Live Trip Logic ───
      const ongoing = formattedMyReqs.find(r => r.status === 'accepted');
      if (ongoing) {
        // Only auto-resume if the trip is "current" (within 2 hours of departure)
        const departure = new Date(ongoing.departureTime);
        const now = new Date();
        const diffMs = now.getTime() - departure.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours >= -1 && diffHours <= 4) { // 1h before to 4h after
           setActiveTrip({
             driverId: ongoing.id, // This is technically the request ID but we use ID for tracking
             driverName: ongoing.driverName,
             driverPhone: ongoing.driverPhone,
             driverRating: 5.0, // Should fetch real if available
             car: 'Vehicle',
             from: ongoing.from,
             to: ongoing.to,
             agreedPrice: ongoing.offeredPrice,
             startedAt: new Date(ongoing.departureTime),
             driverLat: 23.8, // Mock starting point
             driverLng: 90.4,
           });
           setScreen('live_trip');
        }
      }
    }
  };

  const loadProfile = async (userId: string) => {
    // Guard: if already loading this exact user, skip duplicate call
    // (INITIAL_SESSION + SIGNED_IN both fire on fresh login)
    if (loadingUserId.current === userId) {
      console.log("AppContext: loadProfile already in progress for same user, skipping");
      return;
    }
    loadingUserId.current = userId;
    console.log("AppContext: Starting loadProfile for", userId);

    try {
      console.log("AppContext: Querying profiles for", userId);

      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log("AppContext: Profile query finished", { hasData: !!profileData, error: profileErr });

      if (profileErr || !profileData) {
        if (profileErr?.code === 'PGRST116') {
          console.log("AppContext: No profile row found (PGRST116), sending to onboarding");
        } else {
          console.warn("AppContext: Profile query error, sending to onboarding as fallback", profileErr);
        }
        setScreen('onboarding');
        return;
      }

      console.log("AppContext: Fetching vehicles for", userId);
      const { data: vehiclesData } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', userId);

      const vehicles: Vehicle[] = (vehiclesData || []).map(v => ({
        id: v.id as string,
        make: v.make as string,
        model: v.model as string,
        color: v.color as string,
        plate: v.plate as string,
      }));

      const appUser = rowToAppUser(profileData as any, vehicles);
      console.log("AppContext: Profile loaded successfully for", appUser.name);
      setUser(appUser);

      // Fetch app data in background (non-blocking)
      fetchAppData(userId).catch(err => console.error("Error fetching app data:", err));

      if (!appUser.name) {
        console.log("AppContext: User has no name, sending to onboarding");
        setScreen('onboarding');
      } else {
        console.log("AppContext: Sending user to main app");
        setScreen('main');
      }
    } catch (err: any) {
      console.error("Critical error in loadProfile:", err);
      setScreen('onboarding');
    } finally {
      loadingUserId.current = null;
    }
  };

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadProfile(session.user.id);
    }
  };

  const refreshAppData = async () => {
    if (user) await fetchAppData(user.id);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('rs_bypass_user');
    setUser(null);
    setPostedRides([]);
    setMyRequests([]);
    setScreen('login');
  };

  useEffect(() => {
    // Check for dev bypass first
    const bypassStr = localStorage.getItem('rs_bypass_user');
    if (bypassStr) {
      try {
        const mockUser = JSON.parse(bypassStr);
        setUser(mockUser);
        setScreen('main');
        console.log("AppContext: Dev bypass restored from localStorage");
        return; // Skip standard auth flow
      } catch (e) {
        localStorage.removeItem('rs_bypass_user');
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event:", event);
      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session?.user) {
        // User has an active session — load profile and go to app
        await loadProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        loadingUserId.current = null;
        setUser(null);
        setPostedRides([]);
        setMyRequests([]);
        setScreen('landing');
      }
      // INITIAL_SESSION with no user: do nothing, stay on landing page
    });

    // ─── Realtime Subscription for Ride Requests ───
    let channel: any = null;
    if (user?.id) {
       channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to Insert, Update, Delete
            schema: 'public',
            table: 'ride_requests',
          },
          (payload) => {
            console.log('Realtime change received:', payload);
            // Refresh app data whenever a request relevant to us changes
            fetchAppData(user.id);
          }
        )
        .subscribe();
    }

    return () => {
      subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <AppContext.Provider value={{
      screen, setScreen,
      user, setUser,
      pendingPhone, setPendingPhone,
      activeTrip, setActiveTrip,
      completedTrip, setCompletedTrip,
      postedRides, setPostedRides,
      myRequests, setMyRequests,
      refreshProfile,
      refreshAppData,
      signOut,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
