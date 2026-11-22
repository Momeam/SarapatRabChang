export function generateThaiAddressCandidates(raw) {
  const trimmed = (raw || "").trim();
  if (!trimmed) return [];

  const candidates = [{ query: trimmed, label: "ค้นหาตามข้อความเต็ม" }];

  // 1. Remove house numbers (e.g. 45/289, 12/34, 100/1, 555)
  const noHouseNumber = trimmed
    .replace(/\b\d+[\/\-]\d+\b/g, "")
    .replace(/(?:เลขที่|บ้านเลขที่|ห้อง|ชั้น|หมู่ที่|ม\.)\s*\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (noHouseNumber && noHouseNumber !== trimmed && noHouseNumber.length >= 3) {
    candidates.push({ query: noHouseNumber, label: "ตัดเลขที่บ้าน" });
  }

  // 2. Extract specific administrative entities
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
      label: `แขวง${subdistrict} เขต${district} ${province}`,
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

  // Deduplicate by query
  const seen = new Set();
  return candidates.filter((item) => {
    const q = item.query.trim().toLowerCase();
    if (!q || seen.has(q)) return false;
    seen.add(q);
    return true;
  });
}

export async function searchGeocode(query) {
  const candidates = generateThaiAddressCandidates(query);

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const q = candidate.query;

    // Try Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&countrycodes=th&limit=5&accept-language=th`,
        {
          headers: {
            "User-Agent": "SarapatRabChang-App/1.0 (contact@sarapatrabchang.local)",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return {
            results: data.map((item) => ({
              placeId: String(item.place_id),
              displayName: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            })),
            matchedQuery: q,
            isFallback: i > 0,
            fallbackLabel: candidate.label,
          };
        }
      }
    } catch {
      // Ignore and try photon
    }

    // Try Photon
    try {
      const pRes = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`
      );
      if (pRes.ok) {
        const pData = await pRes.json();
        if (Array.isArray(pData.features) && pData.features.length > 0) {
          return {
            results: pData.features.map((f, idx) => {
              const p = f.properties || {};
              const parts = [p.name, p.street, p.district, p.city, p.state, p.postcode].filter(Boolean);
              return {
                placeId: String(p.osm_id || idx + 100000),
                displayName: parts.join(", ") || p.name || q,
                lat: f.geometry.coordinates[1],
                lng: f.geometry.coordinates[0],
              };
            }),
            matchedQuery: q,
            isFallback: i > 0,
            fallbackLabel: candidate.label,
          };
        }
      }
    } catch {
      // Continue to next candidate
    }
  }

  return {
    results: [],
    matchedQuery: query,
    isFallback: false,
    fallbackLabel: null,
  };
}

export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=th`,
      {
        headers: {
          "User-Agent": "SarapatRabChang-App/1.0 (contact@sarapatrabchang.local)",
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        const addr = data.address || {};
        const road = addr.road || addr.suburb || "";
        const district = addr.city_district || addr.district || "";
        const province = addr.city || addr.province || addr.state || "";
        const compact = [road, district, province].filter(Boolean).join(", ") || data.display_name;
        return { displayName: data.display_name, compactAddress: compact };
      }
    }
  } catch {
    // Ignore and fallback to photon
  }

  try {
    const pRes = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
    if (pRes.ok) {
      const pData = await pRes.json();
      if (pData.features && pData.features.length > 0) {
        const p = pData.features[0].properties || {};
        const parts = [p.name, p.street, p.district, p.city, p.state, p.postcode].filter(Boolean);
        const name = parts.join(", ") || p.name || "";
        return { displayName: name, compactAddress: name };
      }
    }
  } catch {
    // Both failed
  }

  return { displayName: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, compactAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}` };
}
