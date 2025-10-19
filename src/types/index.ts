export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  discountPercent?: number;
  categoryId: string;
  imageUrl: string;
  available: boolean;
  isNew?: boolean;
  isOnOffer?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type OrderType = 'dine-in' | 'pickup' | 'delivery';

export interface OrderCustomer {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}

export interface Order {
  id: string;
  items: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  type: OrderType;
  customer: OrderCustomer;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  itemId?: string;
  userName: string;
  rating: number;
  text: string;
  approved: boolean;
  adminReply?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  originalPrice?: number;
  offerPrice?: number;
  discountPercent?: number;
  startDate: string;
  endDate: string;
  active: boolean;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  shopName: string;
  shopNameEn?: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  telegramBotToken?: string;
  telegramChatIds: string[];
  workingHours?: string;
  deliveryFee?: number;
  minOrderAmount?: number;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    snapchat?: string;
    tiktok?: string;
    website?: string;
  };
}

export interface AdminLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details?: string;
  timestamp: Date;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  salary?: string;
  workType: 'full-time' | 'part-time' | 'temporary';
  location: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail?: string;
  cvUrl?: string;
  message: string;
  status: 'new' | 'reviewing' | 'interviewed' | 'accepted' | 'rejected';
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
