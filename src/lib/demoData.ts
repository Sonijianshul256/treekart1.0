import type { AppUser, DailyUpdate, Delivery, Post, Subscription, Tree, VoiceNote } from '@/types';

const ts = (date: string) => ({ toDate: () => new Date(date) } as any);
const geo = (latitude: number, longitude: number) => ({ latitude, longitude } as any);

export const demoUser: AppUser = {
  uid: 'demo-user',
  name: 'Demo Grower',
  email: 'demo@treekart.in',
  city: 'Jaipur',
  referralCode: 'DEMO25',
  carbonTotal: 110,
  onboardingComplete: true,
  notificationSettings: {
    morningPhoto: true,
    soilAlert: true,
    growthUpdate: true,
    weeklyVideo: true,
    harvestAlert: true
  }
};

export const demoTrees: Tree[] = [
  {
    id: 'papaya-a-12',
    type: 'Papaya',
    location: geo(26.9774, 75.3876),
    zone: 'Papaya Block A',
    row: 'A12',
    status: 'rented',
    price: 1500,
    ownerId: 'demo-user',
    sharedWith: [],
    plantedDate: ts('2025-07-01'),
    birthDate: ts('2025-05-20'),
    harvestMonth: 'September',
    userGivenName: 'Priyanka Papaya',
    soilMoisture: 76,
    pestRisk: 14,
    leafHealth: 84,
    photoUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'mango-g-07',
    type: 'Mango',
    location: geo(26.9762, 75.3911),
    zone: 'Mango Grove',
    row: 'G07',
    status: 'rented',
    price: 3000,
    ownerId: 'demo-user',
    sharedWith: [],
    plantedDate: ts('2022-08-01'),
    birthDate: ts('2022-06-15'),
    harvestMonth: 'June',
    userGivenName: 'Meera Mango',
    soilMoisture: 68,
    pestRisk: 22,
    leafHealth: 88,
    photoUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'papaya-a-18',
    type: 'Papaya',
    location: geo(26.9781, 75.3887),
    zone: 'Papaya Block A',
    row: 'A18',
    status: 'soon',
    price: 1500,
    sharedWith: [],
    plantedDate: ts('2026-01-15'),
    harvestMonth: 'November',
    soilMoisture: 71,
    pestRisk: 10,
    leafHealth: 79,
    photoUrl: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80'
  }
];

export const demoUpdates: DailyUpdate[] = [
  {
    id: 'update-1',
    treeId: 'mango-g-07',
    photoUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=1200&q=85',
    timestamp: ts('2026-05-16'),
    activity: 'Neem oil spray completed after morning leaf inspection.',
    soilMoisture: 68,
    geoPoint: geo(26.9762, 75.3911),
    verified: true
  },
  {
    id: 'update-2',
    treeId: 'mango-g-07',
    photoUrl: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&w=1200&q=85',
    timestamp: ts('2026-05-15'),
    activity: 'Mulch refreshed around basin to retain moisture.',
    soilMoisture: 72,
    geoPoint: geo(26.9762, 75.3911),
    verified: true
  }
];

export const demoSubscriptions: Subscription[] = [
  {
    id: 'sub-demo-1',
    userId: 'demo-user',
    treeId: 'mango-g-07',
    startDate: ts('2026-01-01'),
    endDate: ts('2027-01-01'),
    renewalDate: ts('2027-01-01'),
    amount: 3000,
    isShared: false,
    autoRenew: true,
    stripeSubscriptionId: 'sub_demo'
  }
];

export const demoDeliveries: Delivery[] = [
  {
    id: 'delivery-demo-1',
    treeId: 'mango-g-07',
    userId: 'demo-user',
    status: 'packed',
    driverLocation: geo(26.88, 75.77),
    eta: '42 min',
    ripeness: '70% ripe - ready in 2 days',
    driverContact: '+91 90000 00000',
    userAddress: 'Sector 5, Mansarovar, Jaipur'
  },
  {
    id: 'delivery-demo-2',
    treeId: 'papaya-a-12',
    userId: 'demo-user',
    status: 'out_for_delivery',
    driverLocation: geo(26.925, 75.79),
    eta: '12 min',
    ripeness: '85% ripe - ready in 1 day',
    driverContact: '+91 98888 77777',
    userAddress: 'Sector 3, Vaishali Nagar, Jaipur'
  }
];

export const demoPosts: Post[] = [
  {
    id: 'post-demo-1',
    userId: 'demo-user',
    type: 'harvest_share',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=1000&q=85',
    caption: 'First mango box from the grove arrived fragrant and firm.',
    likes: 12,
    likedBy: ['demo-user'],
    comments: [],
    timestamp: ts('2026-05-14'),
    userName: 'Demo Grower',
    treeType: 'Mango'
  }
];

export const demoVoiceNotes: VoiceNote[] = [
  {
    id: 'voice-demo-1',
    treeId: 'mango-g-07',
    farmerAudioUrl: '',
    timestamp: ts('2026-05-16')
  }
];
