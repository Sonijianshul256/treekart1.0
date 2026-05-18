import type { Timestamp, GeoPoint } from 'firebase/firestore';

export type TreeStatus = 'available' | 'rented' | 'soon';
export type TreeType = 'Papaya' | 'Mango';
export type SubscriptionPlan = 'individual' | 'shared' | 'employee_gift' | 'donation' | 'gift';
export type DeliveryStatus = 'picked' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered';

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  city?: string;
  referralCode: string;
  referralCodeInput?: string;
  referralCodeUsed?: string;
  carbonTotal: number;
  subscriptionEndDate?: Timestamp;
  onboardingComplete?: boolean;
  notificationSettings: Record<string, boolean>;
}

export interface Tree {
  id: string;
  type: TreeType;
  location: GeoPoint;
  zone: string;
  row: string;
  status: TreeStatus;
  price: number;
  ownerId?: string;
  sharedWith: string[];
  plantedDate: Timestamp;
  userGivenName?: string;
  birthDate?: Timestamp;
  harvestMonth: string;
  photoUrl?: string;
  soilMoisture?: number;
  pestRisk?: number;
  leafHealth?: number;
}

export interface Subscription {
  id: string;
  userId: string;
  treeId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  amount: number;
  isShared: boolean;
  autoRenew: boolean;
  stripeSubscriptionId?: string;
  renewalDate?: Timestamp;
}

export interface DailyUpdate {
  id: string;
  treeId: string;
  photoUrl: string;
  timestamp: Timestamp;
  activity: string;
  soilMoisture: number;
  geoPoint?: GeoPoint;
  verified?: boolean;
}

export interface Delivery {
  id: string;
  treeId: string;
  userId: string;
  status: DeliveryStatus;
  driverLocation: GeoPoint;
  eta: string;
  ripeness: string;
  driverContact?: string;
  userAddress?: string;
}

export interface Post {
  id: string;
  userId: string;
  treeId?: string;
  type: 'harvest_share' | 'recipe' | 'challenge';
  imageUrl?: string;
  caption: string;
  likes: number;
  likedBy?: string[];
  comments: Array<{ userId: string; text: string; timestamp: Timestamp }>;
  timestamp: Timestamp;
  userName?: string;
  userAvatar?: string;
  treeType?: TreeType;
}

export interface VoiceNote {
  id: string;
  treeId: string;
  farmerAudioUrl: string;
  timestamp: Timestamp;
  replyAudioUrl?: string;
  replyTo?: string;
}

export interface CarbonLog {
  id: string;
  treeId: string;
  userId: string;
  co2Kg: number;
  date: Timestamp;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          'camera-controls'?: boolean;
          'auto-rotate'?: boolean;
          'ar'?: boolean;
          'ar-modes'?: string;
          'shadow-intensity'?: string;
          'shadow-softness'?: string;
          'exposure'?: string;
          'environment-image'?: string;
          'skybox-image'?: string;
          'poster'?: string;
          'interaction-prompt'?: string;
          'interaction-policy'?: string;
          'autoplay'?: boolean;
          'loading'?: string;
          style?: React.CSSProperties;
          class?: string;
        },
        HTMLElement
      >;
    }
  }
}

