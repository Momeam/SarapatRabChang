export interface ProfileReview {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AccountProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  createdAt: string;
  avatarUrl: string;
  bio: string;
  interests: string[];
  address: string;
  taxId: string;
  taxAddress: string;
  taxEmail: string;
  isProvider: boolean;
  rating: number;
  reviewCount: number;
  reviews: ProfileReview[];
}

export type ProfileUpdate = Partial<
  Pick<
    AccountProfile,
    | "fullName"
    | "phone"
    | "bio"
    | "avatarUrl"
    | "interests"
    | "address"
    | "taxId"
    | "taxAddress"
    | "taxEmail"
  >
>;
