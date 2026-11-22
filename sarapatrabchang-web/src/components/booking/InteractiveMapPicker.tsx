"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import { MapPin, Search, Navigation, Info, Loader2, Check } from "lucide-react";

interface InteractiveMapPickerProps {
  pinAddress: string;
  pinCoords: string;
  onLocationSelect?: (address: string, lat: number, lng: number) => void;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LeafletMap {
  remove: () => void;
  setView: (center: [number, number], zoom: number, options?: { animate?: boolean }) => void;
  on: (event: string, fn: (e: { latlng: { lat: number; lng: number } }) => void) => void;
}

interface LeafletMarker {
  getLatLng: () => { lat: number; lng: number };
  setLatLng: (coords: [number, number]) => void;
  on: (event: string, fn: () => void) => void;
}

interface LeafletControl {
  addTo: (map: LeafletMap) => void;
}

interface LeafletTileLayer {
  addTo: (map: LeafletMap) => void;
}

interface LeafletGlobal {
  map: (el: HTMLElement, options?: Record<string, unknown>) => LeafletMap;
  tileLayer: (url: string, options?: Record<string, unknown>) => LeafletTileLayer;
  divIcon: (options: Record<string, unknown>) => unknown;
  marker: (coords: [number, number], options?: Record<string, unknown>) => LeafletMarker & { addTo: (map: LeafletMap) => LeafletMarker };
  control: { zoom: (options?: Record<string, unknown>) => LeafletControl };
}

// Declaring Leaflet global types for TypeScript
declare global {
  interface Window {
    L?: LeafletGlobal;
    google?: Record<string, unknown>;
  }
}

function InteractiveMapPicker({
  pinAddress,
  pinCoords,
  onLocationSelect,
}: InteractiveMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  // Parse initial coordinates or default to Bangkok (13.7326, 100.5703)
  const parseCoords = useCallback((coordStr: string): [number, number] => {
    const parts = coordStr.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return [parts[0], parts[1]];
    }
    return [13.7326, 100.5703];
  }, []);

  const [coords, setCoords] = useState<[number, number]>(() => parseCoords(pinCoords));
  const [address, setAddress] = useState(pinAddress || "บริเวณซอยสุขุมวิท 39 เขตวัฒนา กรุงเทพฯ");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Reverse geocode to get human-readable Thai address from coordinates
  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=th`,
          { headers: { "User-Agent": "SarapatRabChang-App/1.0" } }
        );
        if (!response.ok) return;
        const data = await response.json();
        if (data && data.display_name) {
          // Format compact readable Thai address
          const addr = data.address || {};
          const road = addr.road || addr.suburb || "";
          const district = addr.city_district || addr.district || "";
          const province = addr.city || addr.province || addr.state || "";
          const compact = [road, district, province].filter(Boolean).join(", ") || data.display_name;
          setAddress(compact);
          onLocationSelectRef.current?.(compact, lat, lng);
        }
      } catch {
        // Fallback silently if offline or geocode fails
      }
    },
    []
  );

  // Initialize Leaflet Map once
  useEffect(() => {
    let active = true;

    // Load Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const loadScript = () => {
      if (window.L) {
        initMap();
        return;
      }
      if (!document.getElementById("leaflet-js")) {
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = () => {
          if (active) initMap();
        };
        document.body.appendChild(script);
      } else {
        const existing = document.getElementById("leaflet-js");
        existing?.addEventListener("load", () => {
          if (active) initMap();
        });
      }
    };

    const initMap = () => {
      if (!mapContainerRef.current || mapInstanceRef.current || !window.L) return;

      const L = window.L;
      const initialCoords = parseCoords(pinCoords);
      const initialLat = initialCoords[0];
      const initialLng = initialCoords[1];

      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: false,
      });

      // Add zoom control to top-right
      L.control.zoom({ position: "topright" }).addTo(map);

      // OpenStreetMap Tiles (Fast & Free)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom Orange SVG Pin
      const pinIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
            <div style="background: #09090b; color: white; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); margin-bottom: 2px; white-space: nowrap;">
              จุดนัดหมาย
            </div>
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #f97316; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(249,115,22,0.4); border: 2px solid white;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3" fill="#f97316"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 48],
        iconAnchor: [16, 48],
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      // Handle marker drag
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setCoords([pos.lat, pos.lng]);
        void reverseGeocode(pos.lat, pos.lng);
      });

      // Handle click on map to move marker
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords([lat, lng]);
        void reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setIsMapLoaded(true);
    };

    loadScript();

    return () => {
      active = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []); // Run only once on mount!

  // Update pin position helper
  const updateMapPosition = (lat: number, lng: number, zoom = 16) => {
    setCoords([lat, lng]);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], zoom, { animate: true });
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  // Search places via Nominatim API
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowResults(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&countrycodes=th&limit=5&accept-language=th`,
        { headers: { "User-Agent": "SarapatRabChang-App/1.0" } }
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    updateMapPosition(lat, lng);
    setAddress(result.display_name.split(",").slice(0, 3).join(","));
    onLocationSelect?.(result.display_name, lat, lng);
    setShowResults(false);
    setSearchQuery("");
  };

  // Geolocation button
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการดึงพิกัดปัจจุบัน");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        updateMapPosition(lat, lng, 17);
        void reverseGeocode(lat, lng);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert("ไม่สามารถดึงตำแหน่งปัจจุบันได้: " + (err.message || "กรุณาอนุญาตการเข้าถึงตำแหน่ง"));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900">
            ปักหมุดจุดนัดหมายบนแผนที่
          </h3>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <Check className="w-3 h-3" /> แผนที่พร้อมใช้งาน
          </span>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5">
          คลิกบนแผนที่หรือลากหมุดส้มไปยังจุดที่ต้องการนัดหมาย
        </p>
      </div>

      {/* Location Search Bar */}
      <div className="relative">
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!showResults && e.target.value.trim()) setShowResults(true);
            }}
            placeholder="ค้นหาสถานที่ หรือชื่ออาคาร (เช่น สยาม, อโศก, ห้วยขวาง)..."
            className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "ค้นหา"}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto">
            {searchResults.map((item) => (
              <button
                key={item.place_id}
                type="button"
                onClick={() => handleSelectSearchResult(item)}
                className="w-full text-left px-3.5 py-2 text-xs text-zinc-700 hover:bg-orange-50 hover:text-orange-600 border-b border-zinc-100 last:border-b-0 transition flex items-start gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                <span className="truncate">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Canvas Container */}
      <div className="relative h-72 bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {!isMapLoaded && (
          <div className="absolute inset-0 bg-zinc-50 flex flex-col items-center justify-center text-zinc-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            <span className="text-xs">กำลังโหลดแผนที่แบบโต้ตอบ...</span>
          </div>
        )}
      </div>

      {/* Use My Current Location Button */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={isLocating}
        className="w-full py-2 px-3 bg-zinc-50 hover:bg-zinc-100 disabled:opacity-60 text-zinc-700 rounded-xl border border-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
      >
        {isLocating ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
            <span>กำลังค้นหาพิกัด GPS ของคุณ...</span>
          </>
        ) : (
          <>
            <Navigation className="w-3.5 h-3.5 text-orange-500" />
            <span>ใช้ตำแหน่งปัจจุบันของฉัน (GPS)</span>
          </>
        )}
      </button>

      {/* Pin Coordinates Card */}
      <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/70 space-y-1">
        <div className="flex items-center gap-1 text-xs font-bold text-zinc-800">
          <MapPin className="w-3.5 h-3.5 text-orange-500" />
          <span>สถานที่ปักหมุดปัจจุบัน</span>
        </div>
        <p className="text-xs text-zinc-700 font-medium">{address}</p>
        <p className="text-[11px] text-zinc-400 font-mono">
          พิกัด: {coords[0].toFixed(6)}, {coords[1].toFixed(6)} • คลิกแผนที่เพื่อเปลี่ยนจุดปักหมุดได้ตลอดเวลา
        </p>
      </div>

      <div className="flex items-start gap-1.5 text-[11px] text-zinc-500 leading-normal">
        <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
        <span>
          โปรดตรวจสอบให้หมุดตรงกับที่อยู่ เพื่อให้ช่างเดินทางไปยังจุดนัดหมายได้อย่างแม่นยำ
        </span>
      </div>
    </div>
  );
}

export default memo(InteractiveMapPicker);
