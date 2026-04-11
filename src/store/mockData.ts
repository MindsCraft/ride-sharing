// Mock data for the app — will be replaced by real Supabase data in Phase 2

export interface Driver {
  id: string;
  name: string;
  rating: number;
  rides: number;
  lat: number;
  lng: number;
  car: string;
  carColor: string;
  from: string;
  to: string;
  time: string;
  seats: number;
  price: string;
  priceNum: number;
  isNidVerified: boolean;
  isEmailVerified: boolean;
}

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'd1', name: 'Rahim Ahmed', rating: 4.9, rides: 142,
    lat: 23.8759, lng: 90.3795,
    car: 'Toyota Axio', carColor: 'White',
    from: 'Uttara Sector 11', to: 'Gulshan 1',
    time: '08:30 AM', seats: 2, price: '150–200 BDT', priceNum: 150,
    isNidVerified: true, isEmailVerified: true,
  },
  {
    id: 'd2', name: 'Karim Hossain', rating: 4.7, rides: 89,
    lat: 23.8103, lng: 90.4425,
    car: 'Honda Civic', carColor: 'Silver',
    from: 'Mirpur 10', to: 'Banani',
    time: '09:00 AM', seats: 1, price: '100–120 BDT', priceNum: 100,
    isNidVerified: true, isEmailVerified: false,
  },
  {
    id: 'd3', name: 'Selim Islam', rating: 4.8, rides: 211,
    lat: 23.7465, lng: 90.3762,
    car: 'Nissan Sunny', carColor: 'Blue',
    from: 'Dhanmondi 27', to: 'Motijheel',
    time: '08:00 AM', seats: 3, price: '80–100 BDT', priceNum: 80,
    isNidVerified: true, isEmailVerified: true,
  },
  {
    id: 'd4', name: 'Nasrin Begum', rating: 4.6, rides: 56,
    lat: 23.7925, lng: 90.4077,
    car: 'Toyota Allion', carColor: 'Black',
    from: 'Bashundhara R/A', to: 'Dilkusha',
    time: '08:45 AM', seats: 2, price: 'Negotiable', priceNum: 120,
    isNidVerified: true, isEmailVerified: true,
  },
  {
    id: 'd5', name: 'Rafi Khan', rating: 4.5, rides: 33,
    lat: 23.7237, lng: 90.3879,
    car: 'Suzuki Swift', carColor: 'Red',
    from: 'Mohammadpur', to: 'Karwan Bazar',
    time: '09:15 AM', seats: 1, price: '70 BDT', priceNum: 70,
    isNidVerified: false, isEmailVerified: false,
  },
  {
    id: 'd6', name: 'Tahmina Khanam', rating: 5.0, rides: 18,
    lat: 23.8620, lng: 90.4240,
    car: 'Toyota Rush', carColor: 'White',
    from: 'Baridhara DOHS', to: 'Motijheel',
    time: '08:15 AM', seats: 3, price: '200 BDT', priceNum: 200,
    isNidVerified: true, isEmailVerified: true,
  },
];

export interface ActivityItem {
  id: number;
  type: 'request_sent' | 'request_received' | 'confirmed' | 'completed';
  driverName: string;
  route: string;
  time: string;
  date: string;
  price: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: 1, type: 'request_sent',
    driverName: 'Rahim Ahmed', route: 'Uttara → Gulshan 1',
    time: '08:30 AM', date: 'Today', price: '150 BDT', status: 'confirmed',
  },
  {
    id: 2, type: 'request_received',
    driverName: 'Nasrin Begum', route: 'Bashundhara → Dilkusha',
    time: '08:45 AM', date: 'Today', price: '120 BDT', status: 'pending',
  },
  {
    id: 3, type: 'completed',
    driverName: 'Selim Islam', route: 'Dhanmondi → Motijheel',
    time: '08:00 AM', date: 'Yesterday', price: '95 BDT', status: 'completed',
  },
  {
    id: 4, type: 'completed',
    driverName: 'Karim Hossain', route: 'Mirpur 10 → Banani',
    time: '09:00 AM', date: 'Mon, Apr 7', price: '110 BDT', status: 'completed',
  },
];
