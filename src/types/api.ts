export type UserRole = "admin" | "buyer" | "seller";
export type UserStatus = "active" | "suspended";
export type ListingStatus = "draft" | "pending" | "approved" | "rejected" | "sold";

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  phoneCountry: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  canSell: boolean;
  canBuy: boolean;
};

/** `/admin/users` returns raw user documents rather than the session shape. */
export type AdminUser = Omit<AuthUser, "emailVerified" | "canSell" | "canBuy"> & {
  emailVerifiedAt: string | null;
  createdAt: string;
  originalRole?: UserRole;
  currentMode?: "buyer" | "seller";
};

export type TaxonomyItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  make?: string;
};

export type ListingImage = {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  isPrimary?: boolean;
};

export type Listing = {
  id: string;
  title: string;
  description: string;
  year: number;
  mileage: number;
  price: number;
  make: TaxonomyItem;
  model: TaxonomyItem;
  category: TaxonomyItem;
  condition: TaxonomyItem;
  fuel: TaxonomyItem;
  transmission: TaxonomyItem;
  features: TaxonomyItem[];
  exteriorColor: string;
  interiorColor: string;
  vin: string;
  licensePlate: string;
  state: string;
  engine: string;
  horsePower: string;
  torque: string;
  driveTrain: string;
  doors: string;
  seats: string;
  topSpeed: string;
  contactPhone: string | null;
  status: ListingStatus;
  rejectionReason: string;
  images: ListingImage[];
  views: number;
  seller?: { id?: string; _id?: string; fullName: string; role?: string };
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiErrorBody = {
  success: false;
  error: { message: string; code: string };
};

export type ApiOk<T> = { success: true; data: T };

export type Conversation = {
  id: string;
  listing: { id?: string; _id?: string; title: string; images: ListingImage[]; status: string; price: number };
  buyer: { id?: string; _id?: string; fullName: string; email?: string };
  seller: { id?: string; _id?: string; fullName: string; email?: string };
  lastMessageAt: string;
  lastMessagePreview: string;
  buyerUnread: number;
  sellerUnread: number;
  unread?: number;
};

export type ChatMessage = {
  id: string;
  conversation: string;
  sender: { id?: string; _id?: string; fullName?: string } | string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type Lead = {
  id: string;
  type: "phone" | "chat";
  createdAt: string;
  listing?: { id?: string; title: string };
  buyer?: { fullName: string; email: string; phone?: string };
  seller?: { fullName: string; email: string };
};

export type AdminStats = {
  users: number;
  listings: number;
  pending: number;
  approved: number;
  leads: number;
  conversations: number;
};
