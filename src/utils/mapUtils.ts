import L from 'leaflet';

export interface LatLngPair {
  lat: number;
  lng: number;
  address: string;
}

export const DHAKA_CENTER: [number, number] = [23.8103, 90.4125];

export const POPULAR_LANDMARKS = [
  { name: 'Gulshan 1 Circle', lat: 23.7801, lng: 90.4172 },
  { name: 'Banani 11', lat: 23.7937, lng: 90.4066 },
  { name: 'Dhaka Airport (DAC)', lat: 23.8433, lng: 90.4029 },
  { name: 'Bashundhara R/A Gate', lat: 23.8225, lng: 90.4275 },
  { name: 'Dhanmondi 27', lat: 23.7545, lng: 90.3768 },
  { name: 'Uttara House Building', lat: 23.8732, lng: 90.3989 },
  { name: 'Motijheel C/A', lat: 23.7330, lng: 90.4173 },
  { name: 'Mirpur 10 Circle', lat: 23.8069, lng: 90.3687 }
];

export const UBER_PICKUP_ICON = L.divIcon({
  html: `<div style="width:16px;height:16px;background:#000;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>`,
  className: '',
  iconAnchor: [8, 8],
});

export const UBER_DROPOFF_ICON = L.divIcon({
  html: `<div style="width:16px;height:16px;background:#000;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>`,
  className: '',
  iconAnchor: [8, 8],
});

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    const addr = data.address;
    return (
      addr.neighbourhood || addr.suburb || addr.city_district || addr.road || 
      data.display_name?.split(',')[0] || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    );
  } catch {
    return `Location`;
  }
}

export async function fetchRoute(from: LatLngPair, to: LatLngPair): Promise<[number, number][]> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === 'Ok') {
      return data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
    }
  } catch { }
  return [[from.lat, from.lng], [to.lat, to.lng]];
}

export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
