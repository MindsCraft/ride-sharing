// Auto-generated Supabase database types
// Re-run `supabase gen types typescript` to update after schema changes

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          role: 'rider' | 'driver' | 'both';
          avatar_url: string | null;
          rating: number;
          total_rides: number;
          total_earnings: number;
          is_nid_verified: boolean;
          is_email_verified: boolean;
          work_email: string | null;
          emergency_contact: string | null;
          emergency_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          phone?: string | null;
          role?: 'rider' | 'driver' | 'both';
          avatar_url?: string | null;
          rating?: number;
          total_rides?: number;
          total_earnings?: number;
          is_nid_verified?: boolean;
          is_email_verified?: boolean;
          work_email?: string | null;
          emergency_contact?: string | null;
          emergency_name?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      vehicles: {
        Row: {
          id: string;
          user_id: string;
          make: string;
          model: string;
          color: string;
          plate: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          make: string;
          model: string;
          color: string;
          plate: string;
        };
        Update: Partial<Database['public']['Tables']['vehicles']['Insert']>;
      };
      rides: {
        Row: {
          id: string;
          driver_id: string;
          vehicle_id: string | null;
          from_address: string;
          to_address: string;
          from_lat: number | null;
          from_lng: number | null;
          to_lat: number | null;
          to_lng: number | null;
          departure_time: string;
          total_seats: number;
          seats_left: number;
          price_per_seat: number;
          is_recurring: boolean;
          status: 'active' | 'full' | 'cancelled' | 'completed';
          created_at: string;
        };
        Insert: {
          driver_id: string;
          vehicle_id?: string | null;
          from_address: string;
          to_address: string;
          from_lat?: number | null;
          from_lng?: number | null;
          to_lat?: number | null;
          to_lng?: number | null;
          departure_time: string;
          total_seats: number;
          seats_left?: number;
          price_per_seat: number;
          is_recurring?: boolean;
          status?: 'active' | 'full' | 'cancelled' | 'completed';
        };
        Update: Partial<Database['public']['Tables']['rides']['Insert']>;
      };
      ride_requests: {
        Row: {
          id: string;
          ride_id: string;
          rider_id: string;
          offered_price: number;
          message: string | null;
          status: 'pending' | 'accepted' | 'declined' | 'countered';
          counter_price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          ride_id: string;
          rider_id: string;
          offered_price: number;
          message?: string | null;
          status?: 'pending' | 'accepted' | 'declined' | 'countered';
          counter_price?: number | null;
        };
        Update: Partial<Database['public']['Tables']['ride_requests']['Insert']>;
      };
      ratings: {
        Row: {
          id: string;
          ride_id: string | null;
          rater_id: string;
          rated_id: string;
          stars: number;
          compliments: string[] | null;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          ride_id?: string | null;
          rater_id: string;
          rated_id: string;
          stars: number;
          compliments?: string[] | null;
          comment?: string | null;
        };
        Update: Partial<Database['public']['Tables']['ratings']['Insert']>;
      };
    };
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Vehicle = Database['public']['Tables']['vehicles']['Row'];
export type Ride = Database['public']['Tables']['rides']['Row'];
export type RideRequest = Database['public']['Tables']['ride_requests']['Row'];
export type Rating = Database['public']['Tables']['ratings']['Row'];

// Ride with joined driver profile and vehicle
export type RideWithDriver = Ride & {
  profiles: Profile;
  vehicles: Vehicle | null;
};

// Ride request with joined ride and rider
export type RequestWithRide = RideRequest & {
  rides: Ride & { profiles: Profile };
  profiles: Profile;
};
