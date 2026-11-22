import { Provider } from "@/types";

export interface SavedServiceItem {
  id: string;
  name: string;
  serviceTitle: string;
  category: string;
  avatar: string | null;
  startingPrice: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  serviceAreas: string[];
  savedAt: string;
}

const STORAGE_KEY = "sarapatrabchang.saved-services";

export function getSavedServices(): SavedServiceItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isServiceSaved(providerId: string): boolean {
  return getSavedServices().some((item) => item.id === providerId);
}

export function toggleSavedService(provider: Provider): boolean {
  if (typeof window === "undefined") return false;
  const current = getSavedServices();
  const exists = current.some((item) => item.id === provider.id);
  let next: SavedServiceItem[];
  if (exists) {
    next = current.filter((item) => item.id !== provider.id);
  } else {
    next = [
      {
        id: provider.id,
        name: provider.name,
        serviceTitle: provider.serviceTitle,
        category: provider.category,
        avatar: provider.avatar,
        startingPrice: provider.startingPrice,
        priceUnit: provider.priceUnit,
        rating: provider.rating,
        reviewCount: provider.reviewCount,
        verified: provider.verified,
        serviceAreas: provider.serviceAreas,
        savedAt: new Date().toISOString(),
      },
      ...current,
    ];
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("saved-services-updated"));
  return !exists;
}

export function removeSavedService(providerId: string): SavedServiceItem[] {
  if (typeof window === "undefined") return [];
  const next = getSavedServices().filter((item) => item.id !== providerId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("saved-services-updated"));
  return next;
}
