export interface Product {
  id: string;
  name: string;
  nameAr: string;
  category: 'women' | 'men' | 'unisex';
  volume: string;
  price: number;
  descriptionFr: string;
  descriptionAr: string;
  topNotesFr: string;
  topNotesAr: string;
  heartNotesFr: string;
  heartNotesAr: string;
  baseNotesFr: string;
  baseNotesAr: string;
  image: string;
  inStock: boolean;
  stockQuantity: number;
  isFeatured?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WilayaDeliveryFee {
  code: string;
  nameFr: string;
  nameAr: string;
  homeFee: number;
  deskFee: number;
  available: boolean;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  active: boolean;
  usedCount: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productNameAr: string;
  volume: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  reference: string;
  customerName: string;
  phoneNumber: string;
  wilayaCode: string;
  wilayaName: string;
  commune: string;
  deliveryAddress: string;
  deliveryMethod: 'home' | 'desk';
  deliveryFee: number;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  promoCode?: string;
  total: number;
  paymentMethod: 'cod';
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  freeShippingThreshold: number;
  currency: string;
  siteName: string;
  supportPhone: string;
  supportEmail: string;
  whatsappNumber: string;
}
