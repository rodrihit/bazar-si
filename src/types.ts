export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  cost?: number; // Cost of product from supplier
  stock: number;
  category: string;
  images: string[];
  featured?: boolean;
  dailyPromo?: boolean;
  installments?: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  paymentMethod: string;
  paymentProofUrl?: string; // Comprobante URL / base64
  paymentProofComment?: string; // Código de transferencia
  paymentProofUpdatedAt?: string;
  stockDeducted?: boolean; // Flag to prevent double stock reduction
  couponApplied?: {
    code: string;
    discountAmount: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  };
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  isActive: boolean;
  description: string;
}

export interface StockNotification {
  id: string;
  productId: string;
  productName: string;
  contact: string;
  contactType: 'whatsapp' | 'email';
  status: 'pending' | 'notified';
  createdAt: string;
  notifiedAt?: string;
}

export interface Testimonial {
  id: string;
  userName: string;
  content: string;
  stars: number;
  avatar: string;
}

export interface AppSettings {
  businessName: string;
  tagline: string;
  whatsapp: string;
  address: string;
  hours: {
    monday_friday: string;
    saturday: string;
    sunday: string;
  };
}

export interface Quotation {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  minQuantity: number;
  unitPrice: number;
  status: 'draft' | 'annulled' | 'confirmed';
  createdAt: string;
  updatedAt?: string;
  supplierPhone?: string;
  sellerPhone?: string;
  sourceWebhookUrl?: string;
}

export interface AutomationLog {
  id: string;
  title: string;
  eventType: 'stock_alert_sent' | 'price_auto_adjusted' | 'quotation_webhook' | 'purchase_confirmed_webhook' | 'manual_test' | 'margin_protected';
  payload: any;
  status: 'success' | 'failed';
  timestamp: string;
}
