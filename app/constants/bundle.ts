export type Bundle = {
  id: number;
  label: string;
  originalPrice: number;
  price: number;
  quantity: number;
  savings: string;
  popular: boolean;
};

export type  upsellBundle = {
    id: number;
    label: string;
    price: number;
    quantity: number;
    savings: string;
    popular: boolean;
}

export const bundles: Bundle[] = [
  {
    id: 1,
    label: "Buy 3 Get 2 Free",
    originalPrice: 49783,
    price: 3318,
    quantity: 5,  
    savings: "HIGH SAVING",
    popular: false,
  },
  {
    id: 2,
    label: "Buy 2 Get 1 Free",
    originalPrice: 29870,
    price: 4422,
    quantity: 3,
    savings: "MOST POPULAR",
    popular: true,
  },
  {
    id: 3,
    label: "Buy 1 Get 1 Free",
    originalPrice: 19913,
    price: 4978,
    quantity: 2,
    savings: "",
    popular: false,
  },
];




export const upsellBundle = {
  id: 4,
  label: "Premium Package Upgrade",
  price: 3999,       // $39.99 in cents
  quantity: 2,
  savings: "50% OFF!",
  popular: false,
};
