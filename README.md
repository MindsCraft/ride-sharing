# RideShare BD — Commuter Peer-to-Peer Platform 🚗

**RideShare BD** is a premium, commuter-focused ride-sharing platform designed to simplify daily travel through cost-sharing and community trust. Built with a high-performance tech stack and a clean, Notion-inspired aesthetic.

## ✨ Core Features

### 🙋 For Riders
- **Dynamic Search**: High-performance location search using Nominatim.
- **Smart Negotiation**: Real-time price negotiation with drivers.
- **Live Trip Tracking**: Real-time map view with ETAs and driver progress.
- **Trust Badges**: Interact only with verified drivers (NID/Work Email verified).
- **Safety First**: Integrated SOS button and live trip sharing.

### 🚗 For Drivers
- **Easy Posting**: Publish your daily commute route in seconds.
- **Seat Management**: Control availability and accept/decline rider requests.
- **Earnings Dashboard**: Track your cost-sharing contributions and trip history.
- **Recurring Rides**: Set up weekday commutes once and let the app handle the rest.

## 🛠️ Tech Stack
- **Frontend**: React 19 + TypeScript + Vite 8
- **Styling**: Vanilla CSS (Custom Notion-inspired Design System)
- **Backend / Realtime**: Supabase (Auth, Database, Storage)
- **Maps**: Leaflet + OpenStreetMap (React-Leaflet)
- **PWA**: Fully installable mobile experience via `vite-plugin-pwa`

## 🎨 Design Philosophy
The UI is heavily inspired by **Notion’s** minimalist aesthetic:
- **Warm Neutrals**: Usage of yellow-brown undertones (`#f6f5f4`, `#31302e`) to create a tactile, analog warmth.
- **Precision Typography**: Negative letter-spacing at scale and a strict four-weight system (400, 500, 600, 700).
- **Whisper Borders**: 1px solid translucent borders for structure without visual weight.
- **Ambient Elevation**: Multi-layered shadow stacks for natural depth.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Supabase Project

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/MindsCraft/ride-sharing.git
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Set up environment variables:
   Create a `.env` file with your Supabase credentials.
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Start development:
   ```bash
   npm run dev
   ```

## 📄 License
This project is licensed under the MIT License.
