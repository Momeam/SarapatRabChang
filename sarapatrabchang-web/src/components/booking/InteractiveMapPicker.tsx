"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import { MapPin, Search, Navigation, Info, Loader2, Check, AlertCircle, ArrowUpRight } from "lucide-react";
import { requestApi } from "@/lib/api";

interface InteractiveMapPickerProps {
  pinAddress: string;
  pinCoords: string;
  formAddress?: string;
  onLocationSelect?: (address: string, lat: number, lng: number) => void;
}

interface SearchPlace {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
}

interface GeocodeResponse {
  results: SearchPlace[];
  matchedQuery: string;
  isFallback: boolean;
  fallbackLabel?: string | null;
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

declare global {
  interface Window {
    L?: LeafletGlobal;
  }
}

// Client-side candidate fallback generator
function generateThaiAddressCandidates(raw: string): { query: string; label: string }[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const candidates: { query: string; label: string }[] = [{ query: trimmed, label: "ค้นหาตามข้อความเต็ม" }];

  const noHouseNumber = trimmed
    .replace(/\b\d+[\/\-]\d+\b/g, "")
    .replace(/(?:เลขที่|บ้านเลขที่|ห้อง|ชั้น|หมู่ที่|ม\.)\s*\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (noHouseNumber && noHouseNumber !== trimmed && noHouseNumber.length >= 3) {
    candidates.push({ query: noHouseNumber, label: "ตัดเลขที่บ้าน" });
  }

  const subdistrictMatch = trimmed.match(/(?:แขวง|ตำบล|ต\.)\s*([ก-๙a-zA-Z0-9_\-]+)/);
  const districtMatch = trimmed.match(/(?:เขต|อำเภอ|อ\.)\s*([ก-๙a-zA-Z0-9_\-]+)/);
  const provinceMatch =
    trimmed.match(/(?:จังหวัด|จ\.)\s*([ก-๙]+)/) ||
    trimmed.match(/(กรุงเทพมหานคร|กรุงเทพฯ?|กทม|นนทบุรี|ปทุมธานี|สมุทรปราการ|สมุทรสาคร|นครปฐม|ชลบุรี|ระยอง|เชียงใหม่)/);
  const postalMatch = trimmed.match(/\b\d{5}\b/);

  const subdistrict = subdistrictMatch ? subdistrictMatch[1].trim() : "";
  const district = districtMatch ? districtMatch[1].trim() : "";
  const province = provinceMatch ? provinceMatch[1].trim() : "";
  const postal = postalMatch ? postalMatch[0].trim() : "";

  if (subdistrict && district && province) {
    candidates.push({
      query: `แขวง${subdistrict} เขต${district} ${province}`,
      label: `แขวง${subdistrict} เขต${district}`,
    });
    candidates.push({
      query: `${subdistrict} ${district} ${province}`,
      label: `${subdistrict} ${district}`,
    });
  }

  if (district && province) {
    candidates.push({
      query: `เขต${district} ${province}`,
      label: `เขต${district} ${province}`,
    });
    candidates.push({
      query: `${district} ${province}`,
      label: `${district} ${province}`,
    });
  }

  if (subdistrict && province) {
    candidates.push({
      query: `${subdistrict} ${province}`,
      label: `${subdistrict} ${province}`,
    });
  }

  if (district) {
    candidates.push({ query: `${district} ประเทศไทย`, label: `เขต/อำเภอ ${district}` });
  }

  if (postal) {
    if (district) {
      candidates.push({ query: `${district} ${postal}`, label: `${district} ${postal}` });
    }
    candidates.push({ query: `${postal} ประเทศไทย`, label: `รหัสไปรษณีย์ ${postal}` });
  }

  const seen = new Set<string>();
  return candidates.filter((item) => {
    const q = item.query.trim().toLowerCase();
    if (!q || seen.has(q)) return false;
    seen.add(q);
    return true;
  });
}

function InteractiveMapPicker({
  pinAddress,
  pinCoords,
  formAddress = "",
  onLocationSelect,
}: InteractiveMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  const initialPinCoordsRef = useRef(pinCoords);

  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

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
  const [searchResults, setSearchResults] = useState<SearchPlace[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchNotice, setSearchNotice] = useState<string | null>(null);
  const [noResultsQuery, setNoResultsQuery] = useState<string | null>(null);
  const [suggestedChips, setSuggestedChips] = useState<string[]>([]);

  // Reverse geocoding (API first, direct fallback)
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const data = await requestApi<{ displayName: string; compactAddress: string }>(
        `/api/geocode/reverse?lat=${lat}&lng=${lng}`
      );
      if (data?.compactAddress) {
        setAddress(data.compactAddress);
        onLocationSelectRef.current?.(data.compactAddress, lat, lng);
        return;
      }
    } catch {
      // Fallback to client fetch
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=th`
      );
      if (res.ok) {
        const item = await res.json();
        const addr = item.address || {};
        const road = addr.road || addr.suburb || "";
        const district = addr.city_district || addr.district || "";
        const province = addr.city || addr.province || addr.state || "";
        const compact = [road, district, province].filter(Boolean).join(", ") || item.display_name;
        setAddress(compact);
        onLocationSelectRef.current?.(compact, lat, lng);
      }
    } catch {
      // Fallback to coordinates
      const fallbackStr = `พิกัด ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(fallbackStr);
      onLocationSelectRef.current?.(fallbackStr, lat, lng);
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    let active = true;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

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
      const initialCoords = parseCoords(initialPinCoordsRef.current);
      const initialLat = initialCoords[0];
      const initialLng = initialCoords[1];

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: false,
      });

      L.control.zoom({ position: "topright" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: grab;">
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

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setCoords([pos.lat, pos.lng]);
        setSearchNotice(null);
        void reverseGeocode(pos.lat, pos.lng);
      });

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords([lat, lng]);
        setSearchNotice(null);
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
  }, [parseCoords, reverseGeocode]);

  const updateMapPosition = useCallback((lat: number, lng: number, zoom = 16) => {
    setCoords([lat, lng]);
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], zoom, { animate: true });
      markerRef.current.setLatLng([lat, lng]);
    }
  }, []);

  // Execute geocode search with fallbacks
  const executeSearch = useCallback(
    async (rawQuery: string) => {
      const trimmed = rawQuery.trim();
      if (!trimmed) return;

      setIsSearching(true);
      setShowResults(true);
      setNoResultsQuery(null);
      setSearchNotice(null);

      // Extract helpful chips in case of 0 results
      const districtMatch = trimmed.match(/(?:เขต|อำเภอ|อ\.)\s*([ก-๙a-zA-Z0-9_\-]+)/);
      const subdistrictMatch = trimmed.match(/(?:แขวง|ตำบล|ต\.)\s*([ก-๙a-zA-Z0-9_\-]+)/);
      const chips = [
        subdistrictMatch ? `แขวง${subdistrictMatch[1]}` : "",
        districtMatch ? `เขต${districtMatch[1]}` : "",
      ].filter(Boolean);
      setSuggestedChips(chips);

      try {
        // 1. Try server geocode endpoint
        const apiData = await requestApi<GeocodeResponse>(
          `/api/geocode/search?q=${encodeURIComponent(trimmed)}`
        );

        if (apiData && apiData.results && apiData.results.length > 0) {
          const first = apiData.results[0];
          setSearchResults(apiData.results);

          // Fly to location
          updateMapPosition(first.lat, first.lng, 16);
          const compact = first.displayName.split(",").slice(0, 3).join(",");
          setAddress(compact);
          onLocationSelectRef.current?.(first.displayName, first.lat, first.lng);

          if (apiData.isFallback) {
            setSearchNotice(
              `เลื่อนหมุดไปยังบริเวณ "${apiData.matchedQuery}" แล้ว (เนื่องจากแผนที่แบบเปิดไม่มีเลขที่บ้านแต่ละหลัง โปรดคลิกหรือลากหมุดส้มเพื่อระบุตำแหน่งบ้านของคุณ)`
            );
          } else {
            setSearchNotice(`ปักหมุดที่ "${first.displayName.split(",")[0]}" เรียบร้อยแล้ว`);
          }

          if (apiData.results.length === 1) {
            setShowResults(false);
          }
          return;
        }
      } catch {
        // Server endpoint failed or offline -> use client fallback
      }

      // 2. Direct client fallback with candidate generation
      const candidates = generateThaiAddressCandidates(trimmed);
      let found: SearchPlace[] = [];
      let matchedLabel = "";
      let isFallback = false;

      for (let i = 0; i < candidates.length; i++) {
        const c = candidates[i];
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              c.query
            )}&countrycodes=th&limit=5&accept-language=th`
          );
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              found = data.map((item) => ({
                placeId: String(item.place_id),
                displayName: item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
              }));
              matchedLabel = c.query;
              isFallback = i > 0;
              break;
            }
          }
        } catch {
          // Continue to next candidate
        }

        // Try Photon client-side
        try {
          const pRes = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(c.query)}&limit=5`
          );
          if (pRes.ok) {
            const pData = await pRes.json();
            if (Array.isArray(pData.features) && pData.features.length > 0) {
              found = pData.features.map((f: { properties?: Record<string, string>; geometry: { coordinates: number[] } }, idx: number) => {
                const p = f.properties || {};
                const parts = [p.name, p.street, p.district, p.city, p.state, p.postcode].filter(Boolean);
                return {
                  placeId: String(p.osm_id || idx + 100000),
                  displayName: parts.join(", ") || p.name || c.query,
                  lat: f.geometry.coordinates[1],
                  lng: f.geometry.coordinates[0],
                };
              });
              matchedLabel = c.query;
              isFallback = i > 0;
              break;
            }
          }
        } catch {
          // Continue
        }
      }

      if (found.length > 0) {
        setSearchResults(found);
        const first = found[0];
        updateMapPosition(first.lat, first.lng, 16);
        const compact = first.displayName.split(",").slice(0, 3).join(",");
        setAddress(compact);
        onLocationSelectRef.current?.(first.displayName, first.lat, first.lng);

        if (isFallback) {
          setSearchNotice(
            `เลื่อนหมุดไปยังบริเวณ "${matchedLabel}" แล้ว (เนื่องจากแผนที่แบบเปิดไม่มีเลขที่บ้านแต่ละหลัง โปรดคลิกหรือลากหมุดส้มเพื่อระบุตำแหน่งบ้านของคุณ)`
          );
        } else {
          setSearchNotice(`ปักหมุดที่ "${first.displayName.split(",")[0]}" เรียบร้อยแล้ว`);
        }

        if (found.length === 1) {
          setShowResults(false);
        }
      } else {
        setSearchResults([]);
        setNoResultsQuery(trimmed);
      }
    },
    [updateMapPosition]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void executeSearch(searchQuery);
  };

  const handleSelectSearchResult = (result: SearchPlace) => {
    updateMapPosition(result.lat, result.lng, 17);
    const compact = result.displayName.split(",").slice(0, 3).join(",");
    setAddress(compact);
    onLocationSelectRef.current?.(result.displayName, result.lat, result.lng);
    setShowResults(false);
    setSearchNotice(`ปักหมุดที่ "${compact}" แล้ว สามารถคลิกหรือลากหมุดเพื่อปรับตำแหน่งตามต้องการ`);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการดึงพิกัดปัจจุบัน");
      return;
    }
    setIsLocating(true);
    setSearchNotice(null);
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

  const hasFormAddress = Boolean(formAddress && formAddress.trim().length >= 3);

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

      {/* 1-Click Search from Form Address shortcut */}
      {hasFormAddress && (
        <button
          type="button"
          onClick={() => {
            setSearchQuery(formAddress);
            void executeSearch(formAddress);
          }}
          disabled={isSearching}
          className="w-full text-left p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/80 hover:bg-orange-100/70 transition flex items-center justify-between gap-2 group cursor-pointer text-xs"
        >
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <div className="min-w-0">
              <span className="font-semibold text-orange-950 block">
                ดึงพิกัดจากที่อยู่ที่กรอกในฟอร์ม
              </span>
              <span className="text-[11px] text-orange-700 truncate block">
                {formAddress}
              </span>
            </div>
          </div>
          <span className="shrink-0 text-[11px] font-bold text-orange-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            ค้นหาหมุด <ArrowUpRight className="w-3 h-3" />
          </span>
        </button>
      )}

      {/* Location Search Bar */}
      <div className="relative">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (noResultsQuery) setNoResultsQuery(null);
            }}
            placeholder="ค้นหาชื่อถนน, ซอย, แขวง/ตำบล, เขต/อำเภอ เช่น บางบอน, สยาม..."
            className="w-full pl-9 pr-20 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-1.5 top-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังหา...</span>
              </>
            ) : (
              "ค้นหา"
            )}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 max-h-56 overflow-y-auto">
            <div className="p-2 border-b border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
              <span>ผลการค้นหาสถานที่ ({searchResults.length})</span>
              <button
                type="button"
                onClick={() => setShowResults(false)}
                className="text-zinc-400 hover:text-zinc-600 text-[10px]"
              >
                ปิด
              </button>
            </div>
            {searchResults.map((item) => (
              <button
                key={item.placeId}
                type="button"
                onClick={() => handleSelectSearchResult(item)}
                className="w-full text-left px-3.5 py-2.5 text-xs text-zinc-700 hover:bg-orange-50 hover:text-orange-600 border-b border-zinc-100 last:border-b-0 transition flex items-start gap-2 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{item.displayName}</span>
              </button>
            ))}
          </div>
        )}

        {/* No Results Friendly Feedback Dropdown */}
        {showResults && noResultsQuery && searchResults.length === 0 && !isSearching && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 p-3.5 space-y-2">
            <div className="flex items-start gap-2 text-zinc-800">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-zinc-900">
                  ไม่พบพิกัดตรงกับ &quot;{noResultsQuery}&quot;
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  ระบบแผนที่รองรับการค้นหาด้วย <strong>ชื่อถนน, ชื่อซอย, แขวง/ตำบล หรือ เขต/อำเภอ</strong> (ไม่รองรับเลขที่บ้านเฉพาะหลัง)
                </p>
              </div>
            </div>

            {suggestedChips.length > 0 && (
              <div className="pt-2 border-t border-zinc-100">
                <span className="text-[11px] text-zinc-600 block mb-1.5 font-medium">
                  ลองค้นหาจากบริเวณใกล้เคียง:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setSearchQuery(chip);
                        void executeSearch(chip);
                      }}
                      className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs rounded-lg border border-orange-200 font-medium transition cursor-pointer flex items-center gap-1"
                    >
                      <span>ค้นหา &quot;{chip}&quot;</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowResults(false)}
              className="w-full text-center py-1 text-[11px] text-zinc-400 hover:text-zinc-600 transition"
            >
              ปิดหน้าต่างนี้
            </button>
          </div>
        )}
      </div>

      {/* Helpful banner when approximate match or search succeeded */}
      {searchNotice && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-snug">{searchNotice}</div>
        </div>
      )}

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
          พิกัด: {coords[0].toFixed(6)}, {coords[1].toFixed(6)} • คลิกบนแผนที่หรือลากหมุดส้มเพื่อเปลี่ยนตำแหน่งได้ตลอดเวลา
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
