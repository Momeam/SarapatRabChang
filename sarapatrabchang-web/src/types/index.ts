export interface Provider {
  id: string;
  name: string;
  avatar: string | null;
  category: string;
  categoryKey: string;
  serviceTitle: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  verified: boolean;
  serviceAreas: string[];
  startingPrice: number;
  priceUnit: string;
  responseTime: string;
  experienceYears: number;
  hasTools: boolean;
  workingHours: string;
  description: string;
  packageTitle?: string;
  duration?: string;
  features?: string[];
  reviews?: ProviderReview[];
  portfolio: {
    title: string;
    image: string;
    filename: string;
  }[];
}

export interface ProviderReview {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface BookingDetails {
  jobId: string;
  provider: Provider;
  packageTitle: string;
  packageDescription: string;
  price: number;
  date: string;
  timeSlot: string;
  duration: string;
  address: {
    contactName: string;
    phone: string;
    detail: string;
    coordinates: { lat: number; lng: number };
    note: string;
  };
  features: string[];
  status: "pending_payment" | "paid" | "in_progress" | "delivered" | "completed";
}

export interface Review {
  id: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  rating: number;
  date: string;
  content: string;
  reply?: {
    authorName: string;
    date: string;
    content: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: "user" | "provider";
  senderName: string;
  text: string;
  time: string;
  isRead: boolean;
  orderCard?: {
    jobId: string;
    title: string;
    details: string;
    features: string[];
    dateTime: string;
    price: number;
  };
}

