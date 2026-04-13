import React, { useState, useEffect } from 'react';
import { X, MapPin, Search } from 'lucide-react';
import { type LatLngPair, POPULAR_LANDMARKS, searchLocation } from '../utils/mapUtils';

interface LocationSearchModalProps {
  onClose: () => void;
  onSelect: (loc: LatLngPair) => void;
  placeholder?: string;
}

const LocationSearchModal: React.FC<LocationSearchModalProps> = ({ onClose, onSelect, placeholder = "Where to?" }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<LatLngPair[]>(POPULAR_LANDMARKS.map(l => ({ ...l, address: l.name })));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!search) {
      setResults(POPULAR_LANDMARKS.map(l => ({ ...l, address: l.name })));
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await searchLocation(search);
      setResults(res.length > 0 ? res : POPULAR_LANDMARKS.map(l => ({ ...l, address: l.name })));
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="location-search-overlay">
      <div className="search-header">
        <button className="back-btn" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>
        <div className="search-input-wrapper">
          <input 
            autoFocus
            className="search-input-field" 
            placeholder={placeholder}
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>
      <div className="search-results page-scroll">
        <div className="results-group">
          <div className="results-label">{loading ? 'Searching...' : (search ? 'Search Results' : 'Suggestions')}</div>
          {results.map((loc, i) => (
            <button key={`${loc.lat}-${loc.lng}-${i}`} className="result-item" onClick={() => onSelect(loc)}>
              <div className="icon-circle"><MapPin size={16} /></div>
              <div className="text">
                <div className="name">{loc.address.split(',')[0]}</div>
                <div className="sub">{loc.address.includes(',') ? loc.address.substring(loc.address.indexOf(',') + 2) : 'Dhaka, Bangladesh'}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationSearchModal;
