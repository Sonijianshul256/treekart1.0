// Rural agricultural belt near Jobner, Jaipur district, Rajasthan.
export const FARM_CENTER = { lat: 26.9762, lng: 75.3892 };
export const FARM_BOUNDARY = [
  { lat: 26.9787, lng: 75.3855 },
  { lat: 26.9791, lng: 75.3925 },
  { lat: 26.9741, lng: 75.3931 },
  { lat: 26.9737, lng: 75.386 }
];

export const FARM_ZONES = [
  {
    name: 'Papaya Block A',
    path: [
      { lat: 26.9782, lng: 75.3862 },
      { lat: 26.9785, lng: 75.3894 },
      { lat: 26.9761, lng: 75.3899 },
      { lat: 26.9758, lng: 75.3866 }
    ]
  },
  {
    name: 'Mango Grove',
    path: [
      { lat: 26.9757, lng: 75.3898 },
      { lat: 26.9783, lng: 75.3902 },
      { lat: 26.9773, lng: 75.3922 },
      { lat: 26.9746, lng: 75.3925 }
    ]
  }
];

export const TREE_PRICES = {
  Papaya: 1500,
  Mango: 3000
};

export const CARBON_BY_TREE = {
  Papaya: 40,
  Mango: 70
};

export const STATUS_STEPS = ['picked', 'packed', 'shipped', 'out_for_delivery', 'delivered'] as const;
