import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { type LatLngPair, POPULAR_LANDMARKS } from '../utils/mapUtils';

interface LocationSearchModalProps {
  onClose: () => void;
  onSelect: (loc: LatLngPair) => void;
  placeholder?: string;
}

const LocationSearchModal: React.FC<LocationSearchModalProps> = ({ onClose, onSelect, placeholder = "Where to?" }) => {
  const [search, setSearch] = useState('');
  const results = search 
    ? POPULAR_LANDMARKS.filter(l => l.name.toLowerCase().includes(search.toLowerCase()))
    : POPULAR_LANDMARKS;

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
          <div className="results-label">Suggestions</div>
          {results.map(loc => (
            <button key={loc.name} className="result-item" onClick={() => onSelect({ ...loc, address: loc.name })}>
              <div className="icon-circle"><MapPin size={16} /></div>
              <div className="text">
                <div className="name">{loc.name}</div>
                <div className="sub">Dhaka, Bangladesh</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationSearchModal;
