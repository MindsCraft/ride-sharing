import { createContext, useContext, useState, useEffect } from 'react';
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
  | 'login'
  | 'otp'
  | 'onboarding'
  | 'main'
  | 'live_trip'
  | 'rate_trip';

export interface ActiveTrip {
  driverId: string;
  driverName: string;
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
  isLoadingAuth: boolean;
  refreshProfile: () => Promise<void>;
  refreshAppData: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [screen, setScreen] = useState<AppScreen>('splash');
  const [user, setUser] = useState<AppUser | null>(null);
  const [pendingPhone, setPendingPhone] = useState('');
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [completedTrip, setCompletedTrip] = useState<ActiveTrip | null>(null);
  const [postedRides, setPostedRides] = useState<PostedRide[]>([]);
  const [myRequests, setMyRequests] = useState<MyRideRequest[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

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
          profiles: rider_id (name, rating)
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
          profiles: driver_id (name)
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
        from: req.rides?.from_address || '',
        to: req.rides?.to_address || '',
        departureTime: req.rides?.departure_time ? new Date(req.rides.departure_time).toLocaleString('en-BD', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '',
      }));
      setMyRequests(formattedMyReqs);
    }
  };

  const loadProfile = async (userId: string) => {
    console.log("AppContext: Starting loadProfile for", userId);
    try {
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      console.log("AppContext: Profile data result:", { profileData, profileErr });

      if (profileErr || !profileData) {
        console.warn("Profile not found, sending to onboarding");
        setScreen('onboarding');
        return;
      }

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
      setUser(appUser);
      
      // Fetch app data in background, don't block profile load if it fails
      fetchAppData(userId).catch(err => console.error("Error fetching app data:", err));

      if (!appUser.name) {
        setScreen('onboarding');
      } else {
        setScreen('main');
      }
    } catch (err) {
      console.error("Critical error loading profile:", err);
      // Fallback to onboarding so user isn't stuck
      setScreen('onboarding');
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
    setUser(null);
    setPostedRides([]);
    setMyRequests([]);
    setScreen('login');
  };

  useEffect(() => {
    const init = async () => {
      console.log("AppContext: init() started");
      try {
        console.log("AppContext: Fetching session...");
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("AppContext: Session result:", { session, error });
        if (error) throw error;

        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          console.log("AppContext: No session, going to login");
          setScreen('login');
        }
      } catch (err) {
        console.error("AppContext: Init failed:", err);
        setScreen('login');
      } finally {
        console.log("AppContext: init() finished");
        setIsLoadingAuth(false);
      }
    };

    const timer = setTimeout(init, 1600);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setPostedRides([]);
        setMyRequests([]);
        setScreen('login');
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContext.Provider value={{
      screen, setScreen,
      user, setUser,
      pendingPhone, setPendingPhone,
      activeTrip, setActiveTrip,
      completedTrip, setCompletedTrip,
      postedRides, setPostedRides,
      myRequests, setMyRequests,
      isLoadingAuth,
      refreshProfile,
      refreshAppData,
      signOut,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
